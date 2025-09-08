import express from "express";
const router = express.Router();
import {
  uploadImage,
  uploadMultipleImages,
} from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/uploadMulter.js";

// All routes require authentication
router.use(authenticate);

router.post("/image", upload.single("image"), uploadImage);
router.post("/images", upload.array("images", 10), uploadMultipleImages);

export default router;
