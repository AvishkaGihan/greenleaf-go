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

    googleId: { type: String, sparse: true },
    appleId: { type: String, sparse: true },

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
    preferredLanguage: { type: String, default: "en" },
    currency: { type: String, default: "USD" },

    totalEcoPoints: { type: Number, default: 0 },
    ecoLevel: { type: Number, default: 1 },

    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ appleId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export default mongoose.model("User", userSchema);
