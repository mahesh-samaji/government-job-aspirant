
const mongoose = require("mongoose");

// =====================================================
// EXAM TOPIC SCHEMA
// =====================================================
const examTopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    estimatedMinutes: {
      type: Number,
      required: true,
      min: 1,
      default: 60,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// EXAM SUBJECT / SYLLABUS SCHEMA
// =====================================================
const examSubjectSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    weightage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    topics: {
      type: [examTopicSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// MAIN EXAM SCHEMA
// =====================================================
const examSchema = new mongoose.Schema(
  {
    name: {
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
      default: "Government Exam",
    },

    examDate: {
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

    notificationDate: {
      type: Date,
      default: null,
    },

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

    description: {
      type: String,
      default: "",
    },

    // Structured syllabus for adaptive Study Plan
    syllabus: {
      type: [examSubjectSchema],
      default: [],
    },

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
examSchema.index(
  {
    source: 1,
    sourceId: 1,
  },
  {
    unique: true,
  }
);

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;