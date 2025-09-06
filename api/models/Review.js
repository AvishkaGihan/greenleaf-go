import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What's being reviewed
    reviewType: {
      type: String,
      enum: ["accommodation", "restaurant"],
      required: true,
    },
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
    },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },

    // Review content
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    comment: { type: String, required: true },

    // Eco-specific ratings
    ecoFriendlinessRating: { type: Number, min: 1, max: 5 },
    ecoInitiativesObserved: [String],

    // Review metadata
    stayDate: Date,
    visitDate: Date,
    photos: [String],

    // Moderation
    isVerified: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderationNotes: String,

    // Helpfulness
    helpfulVotes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for unique user reviews per venue
reviewSchema.index(
  { userId: 1, accommodationId: 1 },
  { unique: true, sparse: true }
);
reviewSchema.index(
  { userId: 1, restaurantId: 1 },
  { unique: true, sparse: true }
);

// Indexes for querying
reviewSchema.index({ accommodationId: 1, isApproved: 1 });
reviewSchema.index({ restaurantId: 1, isApproved: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
