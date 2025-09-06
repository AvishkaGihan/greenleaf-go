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

    // Eco-rating components (1-5 scale)
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

// Indexes
accommodationSchema.index({ location: "2dsphere" });
accommodationSchema.index({ city: 1, country: 1 });
accommodationSchema.index({ ecoRating: -1 });
accommodationSchema.index({ priceRange: 1 });
accommodationSchema.index({ isActive: 1, isVerified: 1 });
accommodationSchema.index({ type: 1 });

export default mongoose.model("Accommodation", accommodationSchema);
