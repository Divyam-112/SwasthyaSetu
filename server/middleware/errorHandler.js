import ApiError from "../utils/ApiError.js";

/**
 * Global error handling middleware.
 * Catches all errors thrown in routes/controllers and sends a consistent response.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id: ${err.value}`;
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for '${field}'. This ${field} already exists.`;
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = `Validation Error: ${messages.join(", ")}`;
    error = new ApiError(400, message, messages);
  }

  // JWT errors (if not caught in auth middleware)
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token.");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired. Please login again.");
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
