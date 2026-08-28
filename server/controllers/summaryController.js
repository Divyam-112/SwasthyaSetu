import Session from "../models/Session.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateClinicalSummary } from "../services/aiService.js";

/**
 * POST /api/summary/generate/:sessionId
 * Generate a clinical summary from conversation + documents
 */
export const generateSummary = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId).populate(
    "patient",
    "name age gender abhaId"
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Generate summary using AI
  const summaryData = await generateClinicalSummary(session);

  // Save summary to session
  session.clinicalSummary = {
    generatedText: summaryData.summary,
    ayushSummary: summaryData.ayushSummary || "",
    redFlags: summaryData.redFlags || [],
    abnormalValues: summaryData.abnormalValues || [],
    drugInteractions: summaryData.drugInteractions || [],
    generatedAt: new Date(),
  };

  // Mark session as completed if not already
  if (session.status === "in_progress") {
    session.status = "completed";
    session.completedAt = new Date();
  }

  await session.save();

  res.status(200).json(
    new ApiResponse(200, {
      summary: session.clinicalSummary.generatedText,
      ayushSummary: session.clinicalSummary.ayushSummary,
      redFlags: session.clinicalSummary.redFlags,
      abnormalValues: session.clinicalSummary.abnormalValues,
      drugInteractions: session.clinicalSummary.drugInteractions,
      generatedAt: session.clinicalSummary.generatedAt,
    }, "Clinical summary generated successfully")
  );
});

/**
 * GET /api/summary/:sessionId
 * Get the generated clinical summary
 */
export const getSummary = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId)
    .select("clinicalSummary clinicalHistory ayushAssessment")
    .populate("patient", "name age gender abhaId");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (!session.clinicalSummary || !session.clinicalSummary.generatedText) {
    throw new ApiError(404, "Summary has not been generated yet for this session");
  }

  res.status(200).json(
    new ApiResponse(200, {
      summary: session.clinicalSummary,
      patientInfo: session.patient,
      clinicalHistory: session.clinicalHistory,
      ayushAssessment: session.ayushAssessment,
    }, "Summary retrieved successfully")
  );
});

/**
 * PUT /api/summary/:sessionId
 * Doctor edits/updates the clinical summary
 */
export const updateSummary = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { summaryText, redFlags, abnormalValues } = req.body;

  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Update summary fields
  if (summaryText) session.clinicalSummary.generatedText = summaryText;
  if (redFlags) session.clinicalSummary.redFlags = redFlags;
  if (abnormalValues) session.clinicalSummary.abnormalValues = abnormalValues;

  await session.save();

  res.status(200).json(
    new ApiResponse(200, session.clinicalSummary, "Summary updated successfully")
  );
});
