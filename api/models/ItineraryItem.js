import mongoose from "mongoose";

const itineraryItemSchema = new mongoose.Schema(
  {
    itineraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
      required: true,
    },

    // Item details
    dayNumber: { type: Number, required: true },
    startTime: String,
    endTime: String,
    title: { type: String, required: true },
    description: String,
    notes: String,

    // Location
    address: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
    },

    // Type and references
    itemType: {
      type: String,
      enum: ["accommodation", "restaurant", "activity", "transport", "event"],
      required: true,
    },
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
    },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    conservationEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConservationEvent",
    },

    // Cost
    estimatedCost: Number,
    actualCost: Number,
    currency: { type: String, default: "USD" },

    // Order
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes
itineraryItemSchema.index({ itineraryId: 1, dayNumber: 1 });
itineraryItemSchema.index({ itemType: 1 });

export default mongoose.model("ItineraryItem", itineraryItemSchema);
