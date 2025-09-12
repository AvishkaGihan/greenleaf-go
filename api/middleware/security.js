import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different user types
const limiter = createRateLimiter(
  15 * 60 * 1000,
  500,
  "Too many requests from this IP, please try again later."
);
const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts, please try again later."
);
const userLimiter = createRateLimiter(
  15 * 60 * 1000,
  1000,
  "Too many requests, please try again later."
);
const adminLimiter = createRateLimiter(
  15 * 60 * 1000,
  5000,
  "Too many admin requests, please try again later."
);

export { corsOptions, limiter, authLimiter, userLimiter, adminLimiter, helmet };
