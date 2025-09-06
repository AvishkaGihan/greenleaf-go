import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    settingValue: {
      type: String,
      required: true,
    },
    description: String,
    dataType: {
      type: String,
      enum: ["string", "integer", "boolean", "json"],
      default: "string",
    },
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SystemSettings", systemSettingsSchema);
