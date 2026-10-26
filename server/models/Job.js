const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Basic job information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    organization: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      default: "Government Job",
    },

    // Job details
    vacancies: {
      type: Number,
      default: null,
    },

    qualification: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      trim: true,
      default: "India",
    },

    // Important dates
    notificationDate: {
      type: Date,
      default: null,
    },

    applicationStartDate: {
      type: Date,
      default: null,
    },

    applicationEndDate: {
      type: Date,
      default: null,
    },

    examDate: {
      type: Date,
      default: null,
    },

    // Official links
    notificationUrl: {
      type: String,
      trim: true,
      default: "",
    },

    applyUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Source information
    source: {
      type: String,
      required: true,
      trim: true,
    },

    sourceId: {
      type: String,
      required: true,
      trim: true,
    },

    // Extra information
    description: {
      type: String,
      default: "",
    },

    salary: {
      type: String,
      default: "",
    },

    ageLimit: {
      type: String,
      default: "",
    },

    // Whether the job is currently active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same source job from being added twice
jobSchema.index(
  { source: 1, sourceId: 1 },
  { unique: true }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;