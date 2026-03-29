const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never return password in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    resumeCount: {
      type: Number,
      default: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if pro plan is active
userSchema.methods.isPro = function () {
  if (this.plan !== "pro") return false;
  if (this.planExpiresAt && this.planExpiresAt < new Date()) return false;
  return true;
};

// Instance method: check resume limit
userSchema.methods.canCreateResume = function () {
  if (this.isPro()) return true;
  return this.resumeCount < 1; // free plan: max 1 resume
};

module.exports = mongoose.model("User", userSchema);
