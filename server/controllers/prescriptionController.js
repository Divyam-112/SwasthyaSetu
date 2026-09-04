import Prescription from "../models/Prescription.js";
import Session from "../models/Session.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * POST /api/prescription/:sessionId
 * Doctor creates a digital prescription for a session
 */
export const createPrescription = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const {
    diagnosis,
    medications,
    investigations,
    advice,
    followUpDate,
    notes,
  } = req.body;

  if (!diagnosis) {
    throw new ApiError(400, "Diagnosis is required");
  }

  // Find the session and verify it exists
  const session = await Session.findById(sessionId).populate(
    "patient",
    "name age gender",
  );

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Check if a prescription already exists for this session
  const existingPrescription = await Prescription.findOne({
    session: sessionId,
  });
  if (existingPrescription) {
    throw new ApiError(
      400,
      "A prescription already exists for this session. Use PUT to update it.",
    );
  }

  // Create the prescription
  const prescription = await Prescription.create({
    session: sessionId,
    patient: session.patient._id,
    doctor: req.userId,
    diagnosis,
    medications: medications || [],
    investigations: investigations || [],
    advice: advice || [],
    followUpDate: followUpDate || null,
    notes: notes || "",
  });

  // Link prescription to session
  session.prescription = prescription._id;
  await session.save();

  // Populate doctor info for response
  await prescription.populate("doctor", "name specialization");
  await prescription.populate("patient", "name age gender abhaId");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        prescription,
        "Prescription created successfully",
      ),
    );
});

/**
 * GET /api/prescription/:sessionId
 * Get the prescription for a session
 */
export const getPrescription = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const prescription = await Prescription.findOne({ session: sessionId })
    .populate("doctor", "name specialization email")
    .populate("patient", "name age gender abhaId phone");

  if (!prescription) {
    throw new ApiError(404, "No prescription found for this session");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescription,
        "Prescription retrieved successfully",
      ),
    );
});

/**
 * PUT /api/prescription/:sessionId
 * Doctor updates the prescription for a session
 */
export const updatePrescription = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const {
    diagnosis,
    medications,
    investigations,
    advice,
    followUpDate,
    notes,
  } = req.body;

  const prescription = await Prescription.findOne({ session: sessionId });

  if (!prescription) {
    throw new ApiError(404, "No prescription found for this session");
  }

  // Verify the doctor updating is the same who created it
  if (prescription.doctor.toString() !== req.userId) {
    throw new ApiError(
      403,
      "Only the prescribing doctor can update this prescription",
    );
  }

  // Update fields if provided
  if (diagnosis) prescription.diagnosis = diagnosis;
  if (medications) prescription.medications = medications;
  if (investigations) prescription.investigations = investigations;
  if (advice) prescription.advice = advice;
  if (followUpDate !== undefined) prescription.followUpDate = followUpDate;
  if (notes !== undefined) prescription.notes = notes;

  await prescription.save();

  // Populate for response
  await prescription.populate("doctor", "name specialization");
  await prescription.populate("patient", "name age gender abhaId");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescription,
        "Prescription updated successfully",
      ),
    );
});

/**
 * GET /api/prescription/patient/all
 * Get all prescriptions for the logged-in patient
 */
export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const patientId = req.userId;

  const prescriptions = await Prescription.find({ patient: patientId })
    .populate("doctor", "name specialization")
    .populate("session", "sessionType clinicalHistory.chiefComplaint createdAt")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        "Patient prescriptions retrieved successfully",
      ),
    );
});
