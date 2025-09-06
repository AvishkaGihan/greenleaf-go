import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Notification content
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "event_reminder",
        "badge_earned",
        "itinerary_suggestion",
        "review_request",
        "system_announcement",
      ],
      required: true,
    },

    // Related entities
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "ConservationEvent" },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: "EcoBadge" },
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" },

    // Delivery
    isPush: { type: Boolean, default: true },
    isEmail: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },

    // Scheduling
    sendAt: { type: Date, default: Date.now },
    sentAt: Date,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ sendAt: 1 });
notificationSchema.index({ type: 1 });

export default mongoose.model("Notification", notificationSchema);
