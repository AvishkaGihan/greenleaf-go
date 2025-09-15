import express from "express";
const router = express.Router();
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  rsvpEvent,
  cancelRsvp,
  checkInEvent,
  submitEvent,
  getPendingEvents,
  rejectEvent,
  getVolunteerEvents,
  getAllEvents,
  debugEvents,
} from "../controllers/eventController.js";
import { authenticate, authenticateAdmin } from "../middleware/auth.js";
import {
  eventRsvpValidation,
  eventValidation,
  getEventsValidation,
  eventRejectionValidation,
} from "../middleware/validation/eventValidation.js";

// Public routes
router.get("/", getEventsValidation, getEvents);
router.get("/volunteer", getEventsValidation, getVolunteerEvents);
router.get("/:id", getEvent);
router.get("/debug", debugEvents); // Debug route

// Authenticated user routes
router.post("/submit", authenticate, eventValidation, submitEvent);
router.post("/:id/rsvp", authenticate, eventRsvpValidation, rsvpEvent);
router.delete("/:id/rsvp", authenticate, cancelRsvp);
router.post("/:id/check-in", authenticate, checkInEvent);

// Admin routes
router.get("/admin/pending", authenticateAdmin, getPendingEvents);
router.get("/admin/all", authenticateAdmin, getAllEvents);
router.post("/", authenticateAdmin, eventValidation, createEvent);
router.put("/:id", authenticateAdmin, eventValidation, updateEvent);
router.delete("/:id", authenticateAdmin, deleteEvent);
router.put("/:id/approve", authenticateAdmin, approveEvent);
router.put(
  "/:id/reject",
  authenticateAdmin,
  eventRejectionValidation,
  rejectEvent
);

export default router;
