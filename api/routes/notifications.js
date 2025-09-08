import express from "express";
const router = express.Router();
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerPushToken,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

// All routes require authentication
router.use(authenticate);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);
router.post("/push-token", registerPushToken);

export default router;
