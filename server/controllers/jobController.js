const Job = require("../models/Job");

// --------------------------------------------------
// Get all jobs
// --------------------------------------------------
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Jobs fetched successfully.",
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// --------------------------------------------------
// Get one active job by ID
// --------------------------------------------------
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
      _id: id,
      isActive: true,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      message: "Job fetched successfully.",
      job,
    });
  } catch (error) {
    console.error("Get job error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
};