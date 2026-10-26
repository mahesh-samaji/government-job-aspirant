const express = require("express");

const {
  createStudyPlan,
  getMyStudyPlans,
  getStudyPlanById,
  updateStudyTask,
  deleteStudyPlan,
} = require("../controllers/studyPlanController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create or update study plan
router.post("/", authMiddleware, createStudyPlan);

// Get all study plans of logged-in user
router.get("/", authMiddleware, getMyStudyPlans);

// Get one study plan
router.get("/:id", authMiddleware, getStudyPlanById);

// Update task progress/status
router.patch(
  "/:id/tasks/:taskId",
  authMiddleware,
  updateStudyTask
);

// Delete/deactivate study plan
router.delete(
  "/:id",
  authMiddleware,
  deleteStudyPlan
);

module.exports = router;