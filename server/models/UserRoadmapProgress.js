
const mongoose = require("mongoose");

const userRoadmapProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
      index: true,
    },

    completedSteps: {
      type: [Number],
      default: [],
      validate: {
        validator: (steps) =>
          steps.every(
            (step) => Number.isInteger(step) && step > 0
          ),
        message: "Completed steps must be positive integers.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// One progress record per user per roadmap.
userRoadmapProgressSchema.index(
  { user: 1, roadmap: 1 },
  { unique: true }
);

const UserRoadmapProgress = mongoose.model(
  "UserRoadmapProgress",
  userRoadmapProgressSchema
);

module.exports = UserRoadmapProgress;
