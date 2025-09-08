import express from "express";
const router = express.Router();
import {
  getEvents,
  getEvent,
  createEvent,
  rsvpEvent,
  cancelRsvp,
  checkInEvent,
} from "../controllers/eventController.js";
import { authenticate, authenticateAdmin } from "../middleware/auth.js";
import {
  eventRsvpValidation,
  eventValidation,
  getEventsValidation,
} from "../middleware/validation/eventValidation.js";

// Public routes
router.get("/", getEventsValidation, getEvents);
router.get("/:id", getEvent);

// Authenticated user routes
router.post("/:id/rsvp", authenticate, eventRsvpValidation, rsvpEvent);
router.delete("/:id/rsvp", authenticate, cancelRsvp);
router.post("/:id/check-in", authenticate, checkInEvent);

// Admin routes
router.post("/", authenticateAdmin, eventValidation, createEvent);

export default router;
