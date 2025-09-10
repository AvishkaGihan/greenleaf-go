import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import { corsOptions, limiter, helmet } from "./middleware/security.js";
import { errorHandler } from "./utils/errorHandler.js";

// Route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import accommodationRoutes from "./routes/accommodations.js";
import restaurantRoutes from "./routes/restaurants.js";
import eventRoutes from "./routes/events.js";
import itineraryRoutes from "./routes/itineraries.js";
import reviewRoutes from "./routes/reviews.js";
import badgeRoutes from "./routes/badges.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import searchRoutes from "./routes/search.js";
import analyticsRoutes from "./routes/analytics.js";

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(limiter);
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/accommodations", accommodationRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/itineraries", itineraryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/badges", badgeRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      timestamp: new Date().toISOString(),
    },
  });
});

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

export default app;
