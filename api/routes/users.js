import express from "express";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserBadges,
  getUserActivities,
  getUserItineraries,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { updateProfileValidation } from "../middleware/validation/userValidation";
import { upload } from "../middleware/upload";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, updateProfile);
router.post("/profile/upload-avatar", upload.single("avatar"), uploadAvatar);
router.get("/profile/badges", getUserBadges);
router.get("/profile/activities", getUserActivities);
router.get("/profile/itineraries", getUserItineraries);

export default router;
