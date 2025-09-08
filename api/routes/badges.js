import express from "express";
const router = express.Router();
import {
  getBadges,
  getUserBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from "../controllers/badgeController.js";
import { authenticate, authenticateAdmin } from "../middleware/auth.js";

// Public routes
router.get("/", getBadges);

// Authenticated user routes
router.get("/user", authenticate, getUserBadges);

// Admin routes
router.post("/", authenticateAdmin, createBadge);
router.put("/:id", authenticateAdmin, updateBadge);
router.delete("/:id", authenticateAdmin, deleteBadge);

export default router;
