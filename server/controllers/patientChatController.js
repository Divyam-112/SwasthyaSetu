import PatientChat from "../models/PatientChat.js";
import Session from "../models/Session.js";
import Patient from "../models/Patient.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getPatientChatResponse } from "../services/aiService.js";

/**
 * POST /api/patient-chat/start
 * Start a new AI chat session for the patient.
 * Loads the latest session's clinical summary as context.
 */
export const startChat = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { sessionId } = req.body; // Optional: specific session for context

  // Get the patient
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Find the session to use for context
  let contextSession;
  if (sessionId) {
    contextSession = await Session.findById(sessionId)
      .populate("patient", "name age gender preferredLanguage")
      .populate("prescription");
  } else {
    // Use the latest completed/reviewed session for this patient
    contextSession = await Session.findOne({
      patient: patientId,
      status: { $in: ["completed", "reviewed"] },
    })
      .sort({ createdAt: -1 })
      .populate("patient", "name age gender preferredLanguage")
      .populate("prescription");
  }

  // Build context summary from the session
  let contextSummary = "";
  if (contextSession) {
    const parts = [];

    if (contextSession.clinicalSummary?.generatedText) {
      parts.push(
        `CLINICAL SUMMARY: ${contextSession.clinicalSummary.generatedText}`,
      );
    }
    if (contextSession.clinicalSummary?.ayushSummary) {
      parts.push(
        `AYUSH ASSESSMENT: ${contextSession.clinicalSummary.ayushSummary}`,
      );
    }
    if (contextSession.clinicalHistory?.chiefComplaint) {
      parts.push(
        `CHIEF COMPLAINT: ${contextSession.clinicalHistory.chiefComplaint}`,
      );
    }
    if (contextSession.ayushAssessment?.prakriti) {
      parts.push(`PRAKRITI: ${contextSession.ayushAssessment.prakriti}`);
    }
    if (contextSession.clinicalSummary?.redFlags?.length > 0) {
      parts.push(
        `RED FLAGS: ${contextSession.clinicalSummary.redFlags.join(", ")}`,
      );
    }

    contextSummary = parts.join("\n\n");
  }

  // Get patient's language
  const patientLang = patient.preferredLanguage || "hi";

  // Create the chat
  const chat = await PatientChat.create({
    patient: patientId,
    session: contextSession?._id || null,
    contextSummary,
    messages: [],
  });

  // Generate AI's welcome message using the context
  const welcomeResponse = await getPatientChatResponse(
    [],
    contextSummary,
    patientLang,
    true, // isFirstMessage
  );

  // Save the AI's welcome message
  chat.messages.push({
    role: "ai",
    content: welcomeResponse,
    timestamp: new Date(),
  });
  await chat.save();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        chatId: chat._id,
        messages: chat.messages,
        hasContext: !!contextSummary,
      },
      "Chat started successfully",
    ),
  );
});

/**
 * POST /api/patient-chat/message
 * Patient sends a message, AI responds with health guidance
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { chatId, message } = req.body;

  if (!chatId || !message) {
    throw new ApiError(400, "Chat ID and message are required");
  }

  const chat = await PatientChat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Verify this chat belongs to the logged-in patient
  if (chat.patient.toString() !== patientId) {
    throw new ApiError(403, "You don't have permission to access this chat");
  }

  if (!chat.isActive) {
    throw new ApiError(400, "This chat session is no longer active");
  }

  // Get patient's language
  const patient = await Patient.findById(patientId).select(
    "preferredLanguage",
  );
  const patientLang = patient?.preferredLanguage || "hi";

  // Save patient's message
  chat.messages.push({
    role: "patient",
    content: message,
    timestamp: new Date(),
  });

  // Build conversation history for AI
  const conversationHistory = chat.messages.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.content,
  }));

  // Get AI response
  const aiResponse = await getPatientChatResponse(
    conversationHistory,
    chat.contextSummary,
    patientLang,
    false,
  );

  // Save AI's response
  chat.messages.push({
    role: "ai",
    content: aiResponse,
    timestamp: new Date(),
  });

  await chat.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        patientMessage: message,
        aiResponse,
        totalMessages: chat.messages.length,
      },
      "Message sent successfully",
    ),
  );
});

/**
 * GET /api/patient-chat/history/:chatId
 * Get chat history for a specific chat
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const patientId = req.userId;
  const { chatId } = req.params;

  const chat = await PatientChat.findById(chatId).populate(
    "session",
    "sessionType clinicalHistory.chiefComplaint createdAt",
  );

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Verify ownership
  if (chat.patient.toString() !== patientId) {
    throw new ApiError(403, "You don't have permission to access this chat");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        chatId: chat._id,
        messages: chat.messages,
        session: chat.session,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
      },
      "Chat history retrieved successfully",
    ),
  );
});

/**
 * GET /api/patient-chat/all
 * Get all chat sessions for the logged-in patient
 */
export const getAllChats = asyncHandler(async (req, res) => {
  const patientId = req.userId;

  const chats = await PatientChat.find({ patient: patientId })
    .select("session isActive createdAt updatedAt messages")
    .populate(
      "session",
      "sessionType clinicalHistory.chiefComplaint createdAt",
    )
    .sort({ updatedAt: -1 });

  // Return summary info (not full message history)
  const chatSummaries = chats.map((chat) => ({
    chatId: chat._id,
    session: chat.session,
    isActive: chat.isActive,
    messageCount: chat.messages.length,
    lastMessage:
      chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1].content.substring(0, 100) +
          "..."
        : "",
    lastMessageAt:
      chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1].timestamp
        : chat.createdAt,
    createdAt: chat.createdAt,
  }));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        chatSummaries,
        "All chats retrieved successfully",
      ),
    );
});
