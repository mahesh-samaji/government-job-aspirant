const Exam = require("../models/Exam");

// =====================================================
// GET ALL UPCOMING EXAMS
// =====================================================
const getAllExams = async (req, res) => {
  try {
    const today = new Date();

    // Start from today at 00:00:00
    today.setHours(0, 0, 0, 0);

    const exams = await Exam.find({
      isActive: true,

      // Only exams that have not already happened
      $or: [
        { examDate: null },
        { examDate: { $gte: today } },
      ],
    }).sort({
      examDate: 1,
    });

    return res.status(200).json({
      message: "Exams fetched successfully.",
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("Get exams error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// =====================================================
// GET EXAM BY ID
// =====================================================
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOne({
      _id: id,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      message: "Exam fetched successfully.",
      exam,
    });
  } catch (error) {
    console.error("Get exam error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  getAllExams,
  getExamById,
};