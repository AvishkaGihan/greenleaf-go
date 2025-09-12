import express from "express";
const router = express.Router();
import {
  getBadges,
  getUserBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getBadgeProgress,
  getNextBadges,
  assignBadge,
} from "../controllers/badgeController.js";
import { authenticate, authenticateAdmin } from "../middleware/auth.js";

// Public routes
router.get("/", getBadges);

// Authenticated user routes
router.get("/user", authenticate, getUserBadges);
router.get("/next", authenticate, getNextBadges);
router.get("/:id/progress", authenticate, getBadgeProgress);

// Admin routes
router.post("/", authenticateAdmin, createBadge);
router.put("/:id", authenticateAdmin, updateBadge);
router.delete("/:id", authenticateAdmin, deleteBadge);
router.post("/:id/assign", authenticateAdmin, assignBadge);

export default router;
