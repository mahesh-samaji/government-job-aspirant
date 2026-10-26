
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAllRoadmaps,
  getRoadmapById,
  getRoadmapProgress,
  saveRoadmapProgress,
} = require("../controllers/roadmapController");

// Public: list all active roadmaps.
router.get("/", authMiddleware, getAllRoadmaps);

// Public: get a roadmap and its steps.
router.get("/:id", getRoadmapById);

// Protected: get the logged-in user's progress.
router.get("/:id/progress", authMiddleware, getRoadmapProgress);

// Protected: save the logged-in user's progress.
router.put("/:id/progress", authMiddleware, saveRoadmapProgress);

module.exports = router;
