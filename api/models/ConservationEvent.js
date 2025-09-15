import mongoose from "mongoose";

const conservationEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },

    // Event details
    eventType: {
      type: String,
      enum: [
        "beach-cleanup",
        "tree-planting",
        "wildlife-monitoring",
        "education",
        "research",
        "restoration",
      ],
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "moderate", "challenging"],
      default: "easy",
    },
    ageRequirement: {
      type: Number,
      default: 16,
    },
    physicalRequirements: String,

    // Location
    address: { type: String, required: true },
    city: { type: String, required: true },
    stateProvince: String,
    country: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        // Removed default to prevent automatic creation
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },

    // Timing
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationHours: { type: Number, required: true },

    // Capacity
    maxParticipants: { type: Number, required: true },
    currentParticipants: { type: Number, default: 0 },
    minParticipants: { type: Number, default: 1 },

    // Requirements
    equipmentProvided: [String],
    whatToBring: [String],

    // Organization
    organizerName: { type: String, required: true },
    organizerContact: String,
    organizerWebsite: String,

    // Gamification
    ecoPointsReward: { type: Number, default: 100 },

    // Media
    imageUrls: [String],

    // Admin fields
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Event submission and approval workflow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissionDate: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
conservationEventSchema.index({ location: "2dsphere" });
conservationEventSchema.index({ startDate: 1, endDate: 1 });
conservationEventSchema.index({ city: 1, country: 1 });
conservationEventSchema.index({ eventType: 1 });
conservationEventSchema.index({ isActive: 1, isApproved: 1 });
conservationEventSchema.index({ status: 1 });
conservationEventSchema.index({ submittedBy: 1 });
conservationEventSchema.index({ submissionDate: 1 });

// Middleware to sync isApproved with status
conservationEventSchema.pre("save", function (next) {
  // Sync isApproved field with status for backward compatibility
  this.isApproved = this.status === "approved";

  // Set approvalDate if status is being changed to approved
  if (
    this.isModified("status") &&
    this.status === "approved" &&
    !this.approvalDate
  ) {
    this.approvalDate = new Date();
  }

  next();
});

export default mongoose.model("ConservationEvent", conservationEventSchema);
