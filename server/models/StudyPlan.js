
const mongoose = require("mongoose");

// =====================================================
// STUDY TASK SCHEMA
// =====================================================

const studyTaskSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // Stable identity of the original syllabus topic.
    // Unlike the display topic, this does not contain
    // session-specific text or completion percentages.
    topicKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // User-facing task title
    topic: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Estimated time allocated to this task
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    // Priority assigned by the adaptive planner
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Explanation shown to the user for task priority
    priorityReason: {
      type: String,
      trim: true,
      default: "",
    },

    // Subject weightage snapshot
    weightage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
      ],
      default: "Pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Actual date on which the task is scheduled
    scheduledDate: {
      type: Date,
      required: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

// =====================================================
// MAIN STUDY PLAN SCHEMA
// =====================================================

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    preparationLevel: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
      default: "Beginner",
    },

    dailyStudyHours: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
    },

    // Date when the user starts following this plan
    startDate: {
      type: Date,
      default: Date.now,
    },

    // Target date, normally the selected exam date
    targetDate: {
      type: Date,
      default: null,
    },

    tasks: {
      type: [studyTaskSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// One plan per user for each exam
studyPlanSchema.index(
  {
    user: 1,
    exam: 1,
  },
  {
    unique: true,
  }
);

// Faster active-plan lookup
studyPlanSchema.index({
  user: 1,
  isActive: 1,
});

// Faster scheduled-task lookup
studyPlanSchema.index({
  user: 1,
  "tasks.scheduledDate": 1,
});

// Faster task status lookup
studyPlanSchema.index({
  user: 1,
  exam: 1,
  "tasks.status": 1,
});

// Faster lookup by original topic identity
studyPlanSchema.index({
  user: 1,
  exam: 1,
  "tasks.topicKey": 1,
});

// =====================================================
// MODEL
// =====================================================

const StudyPlan = mongoose.model(
  "StudyPlan",
  studyPlanSchema
);

module.exports = StudyPlan;