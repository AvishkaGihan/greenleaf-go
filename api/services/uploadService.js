// services/uploadService.js
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * uploadToCloudinary(req.file, folder)
 * - file: object from multer (has .buffer, .originalname, .mimetype)
 * - folder: Cloudinary folder name (e.g., "avatars")
 * returns cloudinary upload result (includes secure_url, public_id, etc.)
 */
export const uploadToCloudinary = (file, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    if (!file)
      return reject(new Error("No file provided to uploadToCloudinary"));

    // If file.buffer exists (memoryStorage), stream it
    if (file.buffer) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            // sensible default transform — crop to face/500x500
            { width: 500, height: 500, crop: "fill", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else if (file.path) {
      // fallback if using disk storage
      cloudinary.uploader
        .upload(file.path, { folder })
        .then((result) => resolve(result))
        .catch((err) => reject(err));
    } else {
      reject(new Error("File has neither buffer nor path"));
    }
  });
};
