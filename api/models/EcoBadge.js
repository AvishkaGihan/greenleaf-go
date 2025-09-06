import mongoose from "mongoose";

const ecoBadgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    emoji: String,
    category: {
      type: String,
      enum: ["travel", "volunteering", "conservation", "social", "achievement"],
      required: true,
    },

    // Requirements
    requirementsType: {
      type: String,
      enum: [
        "events_attended",
        "eco_points",
        "accommodations_booked",
        "reviews_written",
        "referrals",
      ],
      required: true,
    },
    requirementsThreshold: {
      type: Number,
      required: true,
    },

    // Rewards
    pointsReward: { type: Number, default: 0 },

    // Badge properties
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EcoBadge", ecoBadgeSchema);
