import express from "express";
const router = express.Router();
import {
  register,
  login,
  socialLogin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
  socialLoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middleware/validation/authValidation.js";

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/social-login", socialLoginValidation, socialLogin);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);

// Protected routes
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
