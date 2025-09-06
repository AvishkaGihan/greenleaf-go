class AppError extends Error {
  constructor(message, statusCode, code, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404, "NOT_FOUND");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 409, "RESOURCE_CONFLICT");
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError("Validation failed", 400, "VALIDATION_ERROR", {
      details: messages,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401, "AUTHENTICATION_REQUIRED");
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401, "AUTHENTICATION_REQUIRED");
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "Server Error",
      details: error.details || {},
      timestamp: new Date().toISOString(),
      request_id: req.requestId || "unknown",
    },
  });
};

export { AppError, errorHandler };
