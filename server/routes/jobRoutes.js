const express = require("express");

const {
  getAllJobs,
  getJobById,
} = require("../controllers/jobController");

const router = express.Router();

// Get all active jobs
router.get("/", getAllJobs);

// Get one job by ID
router.get("/:id", getJobById);

module.exports = router;