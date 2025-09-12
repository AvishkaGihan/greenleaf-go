import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,

    // Trip details
    destinationCity: { type: String, required: true },
    destinationCountry: { type: String, required: true },
    destination: {
      type: String,
      required: true,
      // Virtual field combining destinationCity and destinationCountry
      default: function () {
        return `${this.destinationCity}, ${this.destinationCountry}`;
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: {
      type: Number,
      // Virtual field calculated from startDate and endDate
      default: function () {
        if (this.startDate && this.endDate) {
          const diffTime = Math.abs(this.endDate - this.startDate);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return 1;
      },
    },
    budgetTotal: Number,
    budgetCurrency: { type: String, default: "USD" },

    // Preferences
    travelStyle: {
      type: String,
      enum: ["budget", "mid-range", "luxury"],
      required: true,
    },
    interests: [String],
    groupSize: { type: Number, default: 1 },

    // AI generation
    isAiGenerated: { type: Boolean, default: false },
    generationPrompt: String,

    // Calculated metrics
    ecoScore: { type: Number, min: 1, max: 5 },
    averageEcoRating: { type: Number, min: 1, max: 5 },
    estimatedCarbonFootprint: Number, // kg CO2

    // Moderation fields
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
    isApproved: { type: Boolean, default: true },
    hiddenReason: String,
    deletedReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,

    // Status
    isPublic: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
itinerarySchema.index({ userId: 1 });
itinerarySchema.index({ destinationCity: 1, destinationCountry: 1 });
itinerarySchema.index({ destination: 1 });
itinerarySchema.index({ startDate: 1, endDate: 1 });
itinerarySchema.index({ isPublic: 1 });
itinerarySchema.index({ isFavorite: 1 });
itinerarySchema.index({ isFlagged: 1 });
itinerarySchema.index({ isActive: 1 });
itinerarySchema.index({ averageEcoRating: 1 });

// Pre-save middleware to calculate derived fields
itinerarySchema.pre("save", function (next) {
  // Calculate destination if not set
  if (!this.destination && this.destinationCity && this.destinationCountry) {
    this.destination = `${this.destinationCity}, ${this.destinationCountry}`;
  }

  // Calculate duration if not set
  if (!this.duration && this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }

  next();
});

export default mongoose.model("Itinerary", itinerarySchema);
