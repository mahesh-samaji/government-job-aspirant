const express = require("express");

const {
  getAllExams,
  getExamById,
} = require("../controllers/examController");

const router = express.Router();

// Get all upcoming exams
router.get("/", getAllExams);

// Get one exam by ID
router.get("/:id", getExamById);

module.exports = router;