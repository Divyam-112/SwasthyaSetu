import Session from "../models/Session.js";
import Patient from "../models/Patient.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * POST /api/session/start
 * Start a new history-taking session for a patient
 */
export const startSession = asyncHandler(async (req, res) => {
  const { sessionType } = req.body;
  const patientId = req.userId;

  // Create new session
  const session = await Session.create({
    patient: patientId,
    sessionType: sessionType || "allopathic",
    status: "in_progress",
    completionPercentage: 0,
    currentCategory: "greeting",
  });

  // Link session to patient
  await Patient.findByIdAndUpdate(patientId, {
    $push: { sessions: session._id },
  });

  // First question to ask the patient
  const firstQuestion = {
    question:
      sessionType === "ayush"
        ? "Namaste! Main aapki Ayurvedic health history lene mein madad karunga. Sabse pehle batayein, aapko kya taklif hai?"
        : "Namaste! Main aapki medical history lene mein madad karunga. Sabse pehle batayein, aapko kya taklif hai?",
    options: [
      "Pet mein dard",
      "Sir dard",
      "Bukhar",
      "Khansi / Sardi",
      "Jodo mein dard",
      "Chhaati mein dard",
      "Kuch aur (bolke batayein)",
    ],
    category: "chief_complaint",
    completionPercentage: 0,
    isRedFlag: false,
    redFlagAlert: null,
  };

  // Save the first AI message in conversation
  session.conversation.push({
    role: "ai",
    content: firstQuestion.question,
    inputMode: "text",
    timestamp: new Date(),
    category: "greeting",
  });
  await session.save();

  res.status(201).json(
    new ApiResponse(
      201,
      { sessionId: session._id, firstQuestion },
      "Session started successfully"
    )
  );
});

/**
 * GET /api/session/:sessionId
 * Get session details
 */
export const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId).populate("patient", "name age gender preferredLanguage abhaId");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  res.status(200).json(
    new ApiResponse(200, session, "Session retrieved successfully")
  );
});

/**
 * GET /api/session/patient/all
 * Get all sessions for the logged-in patient
 */
export const getPatientSessions = asyncHandler(async (req, res) => {
  const patientId = req.userId;

  const sessions = await Session.find({ patient: patientId })
    .select("sessionType status completionPercentage clinicalHistory.chiefComplaint createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, sessions, "Sessions retrieved successfully")
  );
});
