const mongoose = require("mongoose");

const registrationVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    tokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired verification records
registrationVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const RegistrationVerification = mongoose.model(
  "RegistrationVerification",
  registrationVerificationSchema
);

module.exports = RegistrationVerification;