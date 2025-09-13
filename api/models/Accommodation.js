import mongoose from "mongoose";

const accommodationSchema = new mongoose.Schema(
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
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    // Contact & Booking
    phone: String,
    email: String,
    websiteUrl: String,
    bookingUrl: String,

    // Accommodation details
    type: {
      type: String,
      enum: [
        "hotel",
        "hostel",
        "resort",
        "guesthouse",
        "apartment",
        "eco-lodge",
      ],
      required: true,
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true,
    },
    checkInTime: {
      type: String,
      default: "15:00",
    },
    checkOutTime: {
      type: String,
      default: "11:00",
    },

    // Eco-rating components (1-5 scale) - now auto-calculated
    energyEfficiencyScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    wasteManagementScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    waterConservationScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    localSourcingScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    carbonFootprintScore: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Eco score calculation metadata
    ecoScoreMetadata: {
      lastCalculated: {
        type: Date,
        default: null,
      },
      reviewsAnalyzed: {
        type: Number,
        default: 0,
      },
      confidenceLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
      },
      googlePlaceId: {
        type: String,
        default: null,
      },
      keywordMatches: {
        type: Number,
        default: 0,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },

    // Calculated eco-rating (virtual)
    ecoRating: {
      type: Number,
      min: 1,
      max: 5,
      get: function () {
        const scores = [
          this.energyEfficiencyScore,
          this.wasteManagementScore,
          this.waterConservationScore,
          this.localSourcingScore,
          this.carbonFootprintScore,
        ].filter((score) => score != null);

        return scores.length
          ? scores.reduce((a, b) => a + b) / scores.length
          : null;
      },
    },

    // Amenities & Features
    amenities: [String],
    certifications: [String],

    // Media
    imageUrls: [String],

    // Admin fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

// Pre-save middleware to sync location coordinates with latitude/longitude
accommodationSchema.pre("save", function (next) {
  // If latitude and longitude are provided, update the location coordinates
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude], // MongoDB expects [longitude, latitude]
    };
  }
  next();
});

// Indexes
accommodationSchema.index({ location: "2dsphere" });
accommodationSchema.index({ city: 1, country: 1 });
accommodationSchema.index({ ecoRating: -1 });
accommodationSchema.index({ priceRange: 1 });
accommodationSchema.index({ isActive: 1, isVerified: 1 });
accommodationSchema.index({ type: 1 });
accommodationSchema.index({ "ecoScoreMetadata.confidenceLevel": -1 });
accommodationSchema.index({ "ecoScoreMetadata.lastCalculated": -1 });

export default mongoose.model("Accommodation", accommodationSchema);
