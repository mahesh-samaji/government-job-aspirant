
const mongoose = require("mongoose");
const Roadmap = require("../models/Roadmap");
const UserRoadmapProgress = require("../models/UserRoadmapProgress");

// GET /api/roadmaps
// Fetch active roadmaps and the logged-in user's saved progress.
const getAllRoadmaps = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Require a valid authenticated user.
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Please log in to view your roadmap progress.",
      });
    }

    // Fetch all active roadmaps.
    const roadmaps = await Roadmap.find({ isActive: true })
      .select("title description duration category steps")
      .sort({ title: 1 })
      .lean();

    // Fetch progress belonging to this user only.
    const progressRecords = await UserRoadmapProgress.find({
      user: userId,
      roadmap: {
        $in: roadmaps.map((roadmap) => roadmap._id),
      },
    })
      .select("roadmap completedSteps")
      .lean();

    // Create a lookup map using roadmap IDs.
    const progressByRoadmapId = new Map(
      progressRecords.map((record) => [
        record.roadmap.toString(),
        record.completedSteps || [],
      ])
    );

    // Calculate each roadmap's progress.
    const roadmapsWithProgress = roadmaps.map((roadmap) => {
      const completedSteps =
        progressByRoadmapId.get(roadmap._id.toString()) || [];

      const totalSteps = roadmap.steps?.length || 0;

      const completedStepsCount = completedSteps.length;

      const progress =
        totalSteps > 0
          ? Math.round((completedStepsCount / totalSteps) * 100)
          : 0;

      return {
        ...roadmap,
        completedSteps,
        completedStepsCount,
        totalSteps,
        progress,
      };
    });

    return res.status(200).json({
      roadmaps: roadmapsWithProgress,
    });
  } catch (error) {
    console.error("Get roadmaps error:", error);

    return res.status(500).json({
      message: "Failed to fetch roadmaps.",
    });
  }
};

// GET /api/roadmaps/:id
// Fetch one active roadmap.
const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid roadmap ID.",
      });
    }

    const roadmap = await Roadmap.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found.",
      });
    }

    return res.status(200).json({ roadmap });
  } catch (error) {
    console.error("Get roadmap error:", error);

    return res.status(500).json({
      message: "Failed to fetch roadmap.",
    });
  }
};

// GET /api/roadmaps/:id/progress
// Fetch the logged-in user's progress for one roadmap.
const getRoadmapProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid roadmap ID.",
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Please log in to view your roadmap progress.",
      });
    }

    const roadmap = await Roadmap.findOne({
      _id: id,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found.",
      });
    }

    const progress = await UserRoadmapProgress.findOne({
      user: userId,
      roadmap: id,
    }).lean();

    return res.status(200).json({
      completedSteps: progress?.completedSteps || [],
    });
  } catch (error) {
    console.error("Get roadmap progress error:", error);

    return res.status(500).json({
      message: "Failed to fetch roadmap progress.",
    });
  }
};

// PUT /api/roadmaps/:id/progress
// Save the logged-in user's completed steps.
const saveRoadmapProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { completedSteps } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid roadmap ID.",
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Please log in to save your roadmap progress.",
      });
    }

    if (
      !Array.isArray(completedSteps) ||
      !completedSteps.every(
        (step) => Number.isInteger(step) && step > 0
      )
    ) {
      return res.status(400).json({
        message: "completedSteps must be an array of positive integers.",
      });
    }

    const roadmap = await Roadmap.findOne({
      _id: id,
      isActive: true,
    }).select("steps");

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found.",
      });
    }

    // Ensure every completed step belongs to this roadmap.
    const validStepNumbers = new Set(
      roadmap.steps.map((step) => step.stepNumber)
    );

    if (completedSteps.some((step) => !validStepNumbers.has(step))) {
      return res.status(400).json({
        message: "One or more completed steps do not exist in this roadmap.",
      });
    }

    // Remove duplicates and sort step numbers.
    const uniqueCompletedSteps = [
      ...new Set(completedSteps),
    ].sort((a, b) => a - b);

    // Upsert one progress record per user and roadmap.
    const savedProgress = await UserRoadmapProgress.findOneAndUpdate(
      {
        user: userId,
        roadmap: id,
      },
      {
        $set: {
          completedSteps: uniqueCompletedSteps,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const totalSteps = roadmap.steps.length;
    const completedStepsCount = savedProgress.completedSteps.length;

    const progress =
      totalSteps > 0
        ? Math.round((completedStepsCount / totalSteps) * 100)
        : 0;

    return res.status(200).json({
      message: "Roadmap progress saved successfully.",
      completedSteps: savedProgress.completedSteps,
      completedStepsCount,
      totalSteps,
      progress,
    });
  } catch (error) {
    console.error("Save roadmap progress error:", error);

    return res.status(500).json({
      message: "Failed to save roadmap progress.",
    });
  }
};

module.exports = {
  getAllRoadmaps,
  getRoadmapById,
  getRoadmapProgress,
  saveRoadmapProgress,
};
