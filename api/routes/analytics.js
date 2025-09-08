import express from "express";
const router = express.Router();
import {
  getUserAnalytics,
  getEnvironmentalImpact,
  getEventAnalytics,
} from "../controllers/analyticsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

// All analytics routes require admin authentication
router.use(authenticateAdmin);

router.get("/users", getUserAnalytics);
router.get("/environmental-impact", getEnvironmentalImpact);
router.get("/events", getEventAnalytics);

export default router;
