import express from "express";
const router = express.Router();
import {
  getDashboard,
  getUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  getReviews,
  approveReview,
  rejectReview,
  flagReview,
  getItineraries,
  getItineraryDetails,
  moderateItinerary,
  getItineraryAnalytics,
  getRsvps,
  cancelRsvpAdmin,
  sendRsvpEmail,
} from "../controllers/adminController.js";
import { authenticateAdmin, logAdminAction } from "../middleware/auth.js";

// All admin routes require admin authentication and logging
router.use(authenticateAdmin);
router.use(logAdminAction);

// Dashboard
router.get("/dashboard", getDashboard);

// User management
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/activate", activateUser);

// Review moderation
router.get("/reviews", getReviews);
router.put("/reviews/:id/approve", approveReview);
router.put("/reviews/:id/reject", rejectReview);
router.put("/reviews/:id/flag", flagReview);

// Itinerary management
router.get("/itineraries/analytics", getItineraryAnalytics);
router.get("/itineraries", getItineraries);
router.get("/itineraries/:id", getItineraryDetails);
router.put("/itineraries/:id/moderate", moderateItinerary);

// RSVP management
router.get("/rsvps", getRsvps);
router.delete("/rsvps/:rsvpId", cancelRsvpAdmin);
router.post("/rsvps/:rsvpId/send-email", sendRsvpEmail);

export default router;
