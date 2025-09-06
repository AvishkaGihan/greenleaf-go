import express from "express";
import {
  getAccommodations,
  getAccommodation,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationReviews,
} from "../controllers/accommodationController";
import { authenticate, authenticateAdmin } from "../middleware/auth";
import {
  accommodationValidation,
  updateAccommodationValidation,
} from "../middleware/validation/accommodationValidation";

const router = express.Router();

// Public routes
router.get("/", getAccommodations);
router.get("/:id", getAccommodation);
router.get("/:id/reviews", getAccommodationReviews);

// Admin routes
router.post(
  "/",
  authenticateAdmin,
  accommodationValidation,
  createAccommodation
);
router.put(
  "/:id",
  authenticateAdmin,
  updateAccommodationValidation,
  updateAccommodation
);
router.delete("/:id", authenticateAdmin, deleteAccommodation);

export default router;
