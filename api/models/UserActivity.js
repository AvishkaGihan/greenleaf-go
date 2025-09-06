import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "event_rsvp",
        "event_attended",
        "accommodation_booked",
        "restaurant_visited",
        "review_written",
        "itinerary_created",
        "badge_earned",
      ],
      required: true,
    },
    pointsEarned: { type: Number, default: 0 },

    // References to related entities
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "ConservationEvent" },
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
    },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: "EcoBadge" },

    // Additional data
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics and gamification
userActivitySchema.index({ userId: 1, activityType: 1 });
userActivitySchema.index({ createdAt: 1 });
userActivitySchema.index({ activityType: 1 });

export default mongoose.model("UserActivity", userActivitySchema);
