import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "approve",
        "reject",
        "flag",
        "unflag",
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        "user",
        "accommodation",
        "restaurant",
        "event",
        "review",
        "itinerary",
      ],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Details
    description: { type: String, required: true },
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,

    // Technical details
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for audit logging
adminLogSchema.index({ adminUserId: 1, createdAt: -1 });
adminLogSchema.index({ entityType: 1, entityId: 1 });
adminLogSchema.index({ actionType: 1 });

export default mongoose.model("AdminLog", adminLogSchema);
