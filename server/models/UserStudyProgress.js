
const mongoose = require("mongoose");

const userStudyProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    // Stable identifier used to match syllabus topics
    // across study-plan regeneration.
    topicKey: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    studyTimeMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastStudiedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  {
    timestamps: true,
  }
);

// One progress record per user, exam, subject, and topic.
userStudyProgressSchema.index(
  {
    user: 1,
    exam: 1,
    subject: 1,
    topic: 1,
  },
  {
    unique: true,
  }
);

// Efficiently retrieve a user's progress for a selected exam.
userStudyProgressSchema.index({
  user: 1,
  exam: 1,
  status: 1,
});

// Efficiently match saved progress by stable topic key.
userStudyProgressSchema.index({
  user: 1,
  exam: 1,
  topicKey: 1,
});

const UserStudyProgress = mongoose.model(
  "UserStudyProgress",
  userStudyProgressSchema
);

module.exports = UserStudyProgress;