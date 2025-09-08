import { AppError } from "../utils/errorHandler.js";
import { uploadToCloudinary } from "../services/uploadService.js";

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400, "VALIDATION_ERROR");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new AppError(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed",
        400,
        "VALIDATION_ERROR"
      );
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      throw new AppError(
        "File size too large. Maximum size is 5MB",
        400,
        "VALIDATION_ERROR"
      );
    }

    const result = await uploadToCloudinary(req.file, "uploads");

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        thumbnail_url: result.secure_url, // Would generate thumbnail in real implementation
        size: req.file.size,
        format: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files uploaded", 400, "VALIDATION_ERROR");
    }

    // Validate all files
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppError(
          "Invalid file type. Only JPEG, PNG, and WebP are allowed",
          400,
          "VALIDATION_ERROR"
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new AppError(
          "File size too large. Maximum size is 5MB",
          400,
          "VALIDATION_ERROR"
        );
      }
    }

    const uploadResults = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, "uploads"))
    );

    res.json({
      success: true,
      data: {
        images: uploadResults.map((result) => ({
          url: result.secure_url,
          thumbnail_url: result.secure_url,
          size: result.bytes,
          format: result.format,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
