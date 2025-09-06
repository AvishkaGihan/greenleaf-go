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
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
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
    estimatedCarbonFootprint: Number, // kg CO2

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
itinerarySchema.index({ startDate: 1, endDate: 1 });
itinerarySchema.index({ isPublic: 1 });
itinerarySchema.index({ isFavorite: 1 });

export default mongoose.model("Itinerary", itinerarySchema);
