import express from "express";
import {
  register,
  login,
  socialLogin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
  socialLoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middleware/validation/authValidation";

const router = express.Router();

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
