import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import { sendEmail } from "../services/emailService.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h",
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      preferredLanguage,
      currency,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        "User already exists with this email",
        409,
        "RESOURCE_CONFLICT"
      );
    }

    // Create user
    const user = new User({
      email,
      passwordHash: password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      preferredLanguage: preferredLanguage || "en",
      currency: currency || "USD",
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || 3600,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          ecoLevel: user.ecoLevel,
          totalEcoPoints: user.totalEcoPoints,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      throw new AppError("Invalid credentials", 401, "AUTHENTICATION_REQUIRED");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401, "AUTHENTICATION_REQUIRED");
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || 3600,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          ecoLevel: user.ecoLevel,
          totalEcoPoints: user.totalEcoPoints,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req, res, next) => {
  try {
    const { provider, providerToken, providerId } = req.body;

    // Implement social login logic (Google/Apple verification)
    // This is a simplified version - you'd need to implement proper OAuth verification

    let user = await User.findOne({
      $or: [
        { googleId: provider === "google" ? providerId : null },
        { appleId: provider === "apple" ? providerId : null },
      ],
    });

    if (!user) {
      // Create new user for social login
      user = new User({
        email: `${providerId}@${provider}.com`, // Temporary email
        [`${provider}Id`]: providerId,
        firstName: "Social",
        lastName: "User",
        emailVerified: true,
      });
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || 3600,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          ecoLevel: user.ecoLevel,
          totalEcoPoints: user.totalEcoPoints,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token required", 400, "VALIDATION_ERROR");
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError(
        "Invalid refresh token",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const { accessToken } = generateTokens(user._id);

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRE || 3600,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "password_reset") {
      throw new AppError("Invalid reset token", 400, "VALIDATION_ERROR");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError("Invalid reset token", 400, "VALIDATION_ERROR");
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
