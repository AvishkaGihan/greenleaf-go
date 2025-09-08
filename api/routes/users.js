import express from "express";
const router = express.Router();
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserBadges,
  getUserActivities,
  getUserItineraries,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import {
  updateProfileValidation,
  getUserActivitiesValidation,
  getUserItinerariesValidation,
} from "../middleware/validation/userValidation.js";
import { upload } from "../middleware/uploadMulter.js";

// All routes require authentication
router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, updateProfile);
router.post("/profile/upload-avatar", upload.single("avatar"), uploadAvatar);
router.get("/profile/badges", getUserBadges);
router.get(
  "/profile/activities",
  getUserActivitiesValidation,
  getUserActivities
);
router.get(
  "/profile/itineraries",
  getUserItinerariesValidation,
  getUserItineraries
);

export default router;
