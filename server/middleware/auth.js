import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

/**
 * Verify JWT token and attach user to request.
 * Works for both patient and doctor tokens.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info based on role
    if (decoded.role === "doctor") {
      const doctor = await Doctor.findById(decoded.id);
      if (!doctor) throw new ApiError(401, "Doctor not found. Invalid token.");
      req.user = doctor;
      req.userRole = "doctor";
    } else {
      const patient = await Patient.findById(decoded.id);
      if (!patient) throw new ApiError(401, "Patient not found. Invalid token.");
      req.user = patient;
      req.userRole = "patient";
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired. Please login again."));
    }
    next(error);
  }
};

/**
 * Restrict access to specific roles.
 * Usage: router.get("/", verifyToken, restrictTo("doctor"), handler)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }
    next();
  };
};

/**
 * Generate JWT token for a user.
 */
export const generateToken = (id, role = "patient") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
