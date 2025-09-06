import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    stateProvince: String,
    country: {
      type: String,
      required: true,
    },
    postalCode: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },

    // Contact & Details
    phone: String,
    email: String,
    websiteUrl: String,

    // Restaurant details
    cuisineType: {
      type: String,
      required: true,
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true,
    },
    openingHours: {
      type: Map,
      of: String, // Store opening hours as key-value pairs
    },

    // Eco-rating components
    localSourcingScore: { type: Number, min: 1, max: 5 },
    organicIngredientsScore: { type: Number, min: 1, max: 5 },
    wasteReductionScore: { type: Number, min: 1, max: 5 },
    energyEfficiencyScore: { type: Number, min: 1, max: 5 },
    packagingSustainabilityScore: { type: Number, min: 1, max: 5 },

    // Calculated eco-rating
    ecoRating: {
      type: Number,
      min: 1,
      max: 5,
      get: function () {
        const scores = [
          this.localSourcingScore,
          this.organicIngredientsScore,
          this.wasteReductionScore,
          this.energyEfficiencyScore,
          this.packagingSustainabilityScore,
        ].filter((score) => score != null);

        return scores.length
          ? scores.reduce((a, b) => a + b) / scores.length
          : null;
      },
    },

    // Features
    dietaryOptions: [String],
    certifications: [String],

    // Media
    imageUrls: [String],

    // Admin fields
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

// Indexes
restaurantSchema.index({ location: "2dsphere" });
restaurantSchema.index({ city: 1, country: 1 });
restaurantSchema.index({ ecoRating: -1 });
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ isActive: 1, isVerified: 1 });

export default mongoose.model("Restaurant", restaurantSchema);
