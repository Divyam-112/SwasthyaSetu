/**
 * Standard API Response wrapper for consistent response format.
 * Usage: res.status(200).json(new ApiResponse(200, data, "Success message"))
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
