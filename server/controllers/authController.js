import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Session from "../models/Session.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../middleware/auth.js";

// ─── PATIENT AUTH ─────────────────────────────────────────────────

/**
 * POST /api/auth/patient/register
 * Register a new patient
 */
export const registerPatient = asyncHandler(async (req, res) => {
  const { name, phone, abhaId, preferredLanguage, age, gender } = req.body;

  if (!name) {
    throw new ApiError(400, "Patient name is required");
  }

  // Check if ABHA ID already exists
  if (abhaId) {
    const existingPatient = await Patient.findOne({ abhaId });
    if (existingPatient) {
      throw new ApiError(400, "Patient with this ABHA ID already exists");
    }
  }

  const patient = await Patient.create({
    name,
    phone,
    abhaId,
    preferredLanguage: preferredLanguage || "hi",
    age,
    gender,
  });

  const token = generateToken(patient._id, "patient");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { patient, token },
        "Patient registered successfully",
      ),
    );
});

/**
 * POST /api/auth/patient/login
 * Login patient via ABHA ID
 */
export const loginPatient = asyncHandler(async (req, res) => {
  const { abhaId } = req.body;

  if (!abhaId) {
    throw new ApiError(400, "ABHA ID is required");
  }

  const patient = await Patient.findOne({ abhaId });

  if (!patient) {
    throw new ApiError(
      404,
      "Patient not found with this ABHA ID. Please register first.",
    );
  }

  const token = generateToken(patient._id, "patient");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { patient, token },
        "Patient logged in successfully",
      ),
    );
});

/**
 * POST /api/auth/patient/consent
 * Record patient consent for data collection/sharing
 */
export const recordConsent = asyncHandler(async (req, res) => {
  const { sessionId, dataCollection, dataSharing, abhaLinking, method } =
    req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  // Verify this session belongs to the logged-in patient
  if (session.patient.toString() !== req.userId) {
    throw new ApiError(403, "You don't have permission to update this session");
  }

  session.consent = {
    dataCollectionConsent: dataCollection || false,
    dataSharingConsent: dataSharing || false,
    abhaLinkingConsent: abhaLinking || false,
    consentTimestamp: new Date(),
    consentMethod: method || "touch",
  };

  await session.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { consent: session.consent },
        "Consent recorded successfully",
      ),
    );
});

// ─── DOCTOR AUTH ──────────────────────────────────────────────────

/**
 * POST /api/auth/doctor/register
 * Register a new doctor
 */
export const registerDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, specialization, hospitalId } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new ApiError(400, "Doctor with this email already exists");
  }

  const doctor = await Doctor.create({
    name,
    email,
    password,
    specialization,
    hospitalId,
  });

  // Remove password from response
  const doctorResponse = doctor.toObject();
  delete doctorResponse.password;

  const token = generateToken(doctor._id, "doctor");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { doctor: doctorResponse, token },
        "Doctor registered successfully",
      ),
    );
});

/**
 * POST /api/auth/doctor/login
 * Login doctor via email + password
 */
export const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Need to explicitly select password since it's excluded by default
  const doctor = await Doctor.findOne({ email }).select("+password");

  if (!doctor) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await doctor.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const doctorResponse = doctor.toObject();
  delete doctorResponse.password;

  const token = generateToken(doctor._id, "doctor");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { doctor: doctorResponse, token },
        "Doctor logged in successfully",
      ),
    );
});
