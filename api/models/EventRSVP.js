import mongoose from "mongoose";

const eventRsvpSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConservationEvent",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // RSVP details
    status: {
      type: String,
      enum: ["registered", "waitlisted", "attended", "no-show", "cancelled"],
      default: "registered",
    },
    registrationDate: { type: Date, default: Date.now },

    // Participant info
    emergencyContactName: String,
    emergencyContactPhone: String,
    dietaryRestrictions: String,
    specialRequirements: String,

    // Check-in details
    checkedInAt: Date,
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Feedback
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackComment: String,
  },
  {
    timestamps: true,
  }
);

// Compound index for unique RSVPs
eventRsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Indexes for querying
eventRsvpSchema.index({ eventId: 1, status: 1 });
eventRsvpSchema.index({ userId: 1 });

export default mongoose.model("EventRSVP", eventRsvpSchema);
