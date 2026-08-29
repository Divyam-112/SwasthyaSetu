import Session from "../models/Session.js";
import Patient from "../models/Patient.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getNextQuestion, extractClinicalData } from "../services/aiService.js";
import { getSpeechConfig } from "../services/speechService.js";

/**
 * POST /api/conversation/respond
 * Patient sends a response (text/touch), AI generates next question.
 */
export const respondToQuestion = asyncHandler(async (req, res) => {
  const { sessionId, answer, inputMode } = req.body;

  if (!sessionId || !answer) {
    throw new ApiError(400, "Session ID and answer are required");
  }

  const session = await Session.findById(sessionId).populate(
    "patient",
    "preferredLanguage",
  );
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.status !== "in_progress") {
    throw new ApiError(400, "This session is no longer active");
  }

  // Get patient's preferred language
  const patientLang = session.patient?.preferredLanguage || "hi";

  // Save patient's answer in conversation
  session.conversation.push({
    role: "patient",
    content: answer,
    inputMode: inputMode || "text",
    timestamp: new Date(),
    category: session.currentCategory,
  });

  // Build conversation history for LLM
  const conversationHistory = session.conversation.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.content,
  }));

  // Get next question from AI (in patient's preferred language)
  const aiResponse = await getNextQuestion(
    conversationHistory,
    session.sessionType,
    patientLang,
  );

  // Save AI's next question in conversation
  session.conversation.push({
    role: "ai",
    content: aiResponse.question,
    inputMode: "text",
    timestamp: new Date(),
    category: aiResponse.category,
  });

  // Update session progress
  session.completionPercentage =
    aiResponse.completionPercentage || session.completionPercentage;
  session.currentCategory = aiResponse.category || session.currentCategory;

  // If AI extracted structured data, merge it into clinicalHistory
  if (aiResponse.extractedData) {
    await extractClinicalData(session, aiResponse.extractedData);
  }

  // Check if history is complete
  if (aiResponse.completionPercentage >= 100) {
    session.status = "completed";
    session.completedAt = new Date();
  }

  // Handle red flags
  if (aiResponse.isRedFlag) {
    session.clinicalSummary = session.clinicalSummary || {};
    if (!session.clinicalSummary.redFlags) {
      session.clinicalSummary.redFlags = [];
    }
    session.clinicalSummary.redFlags.push(aiResponse.redFlagAlert);
  }

  await session.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        nextQuestion: {
          question: aiResponse.question,
          options: aiResponse.options,
          category: aiResponse.category,
          completionPercentage: aiResponse.completionPercentage,
          isRedFlag: aiResponse.isRedFlag || false,
          redFlagAlert: aiResponse.redFlagAlert || null,
        },
      },
      "Response recorded successfully",
    ),
  );
});

/**
 * POST /api/conversation/voice
 * Patient sends transcribed text (STT done on client via Web Speech API)
 * Server processes it through AI and returns next question.
 * Client handles TTS playback using Web Speech API.
 */
export const respondVoice = asyncHandler(async (req, res) => {
  const { sessionId, transcribedText, language } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  if (!transcribedText || transcribedText.trim() === "") {
    throw new ApiError(
      400,
      "Transcribed text is required. Please speak clearly and try again.",
    );
  }

  const session = await Session.findById(sessionId).populate(
    "patient",
    "preferredLanguage",
  );
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.status !== "in_progress") {
    throw new ApiError(400, "This session is no longer active");
  }

  // Get patient's preferred language (fallback to request body language, then Hindi)
  const patientLang = session.patient?.preferredLanguage || language || "hi";

  // Save patient's voice-transcribed answer in conversation
  session.conversation.push({
    role: "patient",
    content: transcribedText.trim(),
    inputMode: "voice",
    timestamp: new Date(),
    category: session.currentCategory,
  });

  // Build conversation history for LLM
  const conversationHistory = session.conversation.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.content,
  }));

  // Get next question from AI (in patient's preferred language)
  const aiResponse = await getNextQuestion(
    conversationHistory,
    session.sessionType,
    patientLang,
  );

  // Save AI response
  session.conversation.push({
    role: "ai",
    content: aiResponse.question,
    inputMode: "text",
    timestamp: new Date(),
    category: aiResponse.category,
  });

  session.completionPercentage =
    aiResponse.completionPercentage || session.completionPercentage;
  session.currentCategory = aiResponse.category || session.currentCategory;

  // If AI extracted structured data, merge it into clinicalHistory
  if (aiResponse.extractedData) {
    await extractClinicalData(session, aiResponse.extractedData);
  }

  if (aiResponse.completionPercentage >= 100) {
    session.status = "completed";
    session.completedAt = new Date();
  }

  // Handle red flags
  if (aiResponse.isRedFlag) {
    session.clinicalSummary = session.clinicalSummary || {};
    if (!session.clinicalSummary.redFlags) {
      session.clinicalSummary.redFlags = [];
    }
    session.clinicalSummary.redFlags.push(aiResponse.redFlagAlert);
  }

  await session.save();

  // Get speech config for client-side TTS playback
  const speechConfig = getSpeechConfig(language || "hi");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        transcribedText: transcribedText.trim(),
        nextQuestion: {
          question: aiResponse.question,
          options: aiResponse.options,
          category: aiResponse.category,
          completionPercentage: aiResponse.completionPercentage,
          isRedFlag: aiResponse.isRedFlag || false,
          redFlagAlert: aiResponse.redFlagAlert || null,
        },
        speechConfig: speechConfig.tts, // Client uses this for TTS playback
      },
      "Voice response processed successfully",
    ),
  );
});

/**
 * GET /api/conversation/:sessionId
 * Get full conversation history for a session
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId).select(
    "conversation completionPercentage currentCategory status",
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        conversation: session.conversation,
        completionPercentage: session.completionPercentage,
        currentCategory: session.currentCategory,
        status: session.status,
      },
      "Conversation retrieved successfully",
    ),
  );
});
