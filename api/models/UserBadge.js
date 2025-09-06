import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EcoBadge",
    required: true,
  },
  earnedAt: { type: Date, default: Date.now },
});

// Compound index for unique user-badge combinations
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model("UserBadge", userBadgeSchema);
