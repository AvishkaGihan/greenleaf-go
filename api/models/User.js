import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId && !this.appleId;
      },
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    profileImageUrl: String,
    phone: String,
    dateOfBirth: Date,

    // Authentication providers
    googleId: { type: String, sparse: true },
    appleId: { type: String, sparse: true },

    // User preferences
    budgetRange: {
      type: String,
      enum: ["budget", "mid-range", "luxury"],
      default: "mid-range",
    },
    ecoInterests: [
      {
        type: String,
        enum: ["nature", "culture", "food", "wildlife", "renewable-energy"],
      },
    ],
    preferredLanguage: {
      type: String,
      default: "en",
    },
    currency: {
      type: String,
      default: "USD",
    },

    // Gamification
    totalEcoPoints: {
      type: Number,
      default: 0,
    },
    ecoLevel: {
      type: Number,
      default: 1,
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive information from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export default mongoose.model("User", userSchema);
