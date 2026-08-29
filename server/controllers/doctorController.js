import Session from "../models/Session.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/doctor/queue
 * Get all patients in queue (sessions with completed/in_progress status)
 */
export const getPatientQueue = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    status: { $in: ["completed", "in_progress"] },
  })
    .populate("patient", "name age gender abhaId preferredLanguage")
    .select(
      "patient sessionType status completionPercentage clinicalHistory.chiefComplaint clinicalSummary.redFlags createdAt",
    )
    .sort({ createdAt: -1 });

  // Format for queue display
  const queue = sessions.map((session) => ({
    sessionId: session._id,
    patientName: session.patient?.name || "Unknown",
    age: session.patient?.age,
    gender: session.patient?.gender,
    abhaId: session.patient?.abhaId,
    sessionType: session.sessionType,
    chiefComplaint:
      session.clinicalHistory?.chiefComplaint || "Not recorded yet",
    status: session.status,
    completionPercentage: session.completionPercentage,
    hasRedFlags: session.clinicalSummary?.redFlags?.length > 0,
    redFlags: session.clinicalSummary?.redFlags || [],
    createdAt: session.createdAt,
  }));

  res
    .status(200)
    .json(new ApiResponse(200, queue, "Patient queue retrieved successfully"));
});

/**
 * GET /api/doctor/patient/:sessionId
 * Get full patient data for a specific session (doctor view)
 */
export const getPatientDetail = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId)
    .populate("patient", "name age gender abhaId phone preferredLanguage")
    .populate("doctorReview.reviewedBy", "name specialization");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, session, "Patient details retrieved successfully"),
    );
});

/**
 * PUT /api/doctor/review/:sessionId
 * Doctor submits review (accept/modify/reject)
 */
export const submitReview = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { status, modifications } = req.body;

  if (!status || !["accepted", "modified", "rejected"].includes(status)) {
    throw new ApiError(
      400,
      "Valid review status is required (accepted/modified/rejected)",
    );
  }

  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  session.doctorReview = {
    reviewedBy: req.userId,
    reviewedAt: new Date(),
    status,
    modifications: modifications || "",
  };

  session.status = "reviewed";

  await session.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionId,
        reviewStatus: status,
        reviewedAt: session.doctorReview.reviewedAt,
      },
      `Session ${status} successfully`,
    ),
  );
});
