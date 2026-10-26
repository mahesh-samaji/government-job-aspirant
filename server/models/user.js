const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Registration profile information
    qualification: {
      type: String,
      trim: true,
      default: "",
    },

    preferredJob: {
      type: String,
      trim: true,
      default: "",
    },

    preparationLevel: {
      type: String,
      trim: true,
      default: "",
    },

    studyHours: {
      type: String,
      trim: true,
      default: "",
    },

    // Account verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // User role
    role: {
      type: String,
      enum: ["candidate", "admin"],
      default: "candidate",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;