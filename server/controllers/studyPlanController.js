
const StudyPlan = require("../models/StudyPlan");
const Exam = require("../models/Exam");
const UserStudyProgress = require("../models/UserStudyProgress");
const { generateStudyTasks } = require("../services/studyPlanGenerator");

// =====================================================
// HELPERS
// =====================================================

const getOriginalTopic = (topic = "") => {
  return String(topic)
    .replace(
      /^(Learn and practice|Revise and practice|Advanced practice|Practice):\s*/i,
      ""
    )
    .replace(/\s*\(\d+%\s+of planned study time\)\s*$/i, "")
    .trim();
};

const normalizeKeyPart = (value = "") => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createTopicKey = (subject, topic) => {
  return `${normalizeKeyPart(subject)}::${normalizeKeyPart(topic)}`;
};

const getTaskTopicKey = (task) => {
  if (task.topicKey) {
    return String(task.topicKey).trim().toLowerCase();
  }

  return createTopicKey(
    task.subject,
    getOriginalTopic(task.topic)
  );
};

const getTopicSlugFromKey = (topicKey) => {
  return String(topicKey).split("::")[1] || "general-topic";
};

const getProgressStatus = (progress) => {
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Not Started";
};

const getExamTargetDate = (exam) => {
  return exam.examDate || exam.applicationEndDate || null;
};

const getTaskId = (task) => {
  return task?._id ? String(task._id) : null;
};

const getTaskProgress = (task) => {
  return Math.min(
    100,
    Math.max(0, Number(task.progress) || 0)
  );
};

// =====================================================
// CREATE OR REGENERATE STUDY PLAN
// =====================================================

const createStudyPlan = async (req, res) => {
  try {
    const {
      examId,
      preparationLevel,
      dailyStudyHours,
    } = req.body;

    if (!examId) {
      return res.status(400).json({
        message: "Exam ID is required.",
      });
    }

    const hours = Number(dailyStudyHours);

    if (
      !Number.isFinite(hours) ||
      hours < 1 ||
      hours > 24
    ) {
      return res.status(400).json({
        message: "Daily study hours must be between 1 and 24.",
      });
    }

    const allowedLevels = [
      "Beginner",
      "Intermediate",
      "Advanced",
    ];

    const level = preparationLevel || "Beginner";

    if (!allowedLevels.includes(level)) {
      return res.status(400).json({
        message: "Invalid preparation level.",
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(String(examId))) {
      return res.status(400).json({
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found.",
      });
    }

    const userId = req.user.userId;

    const existingPlan = await StudyPlan.findOne({
      user: userId,
      exam: examId,
    });

    const userProgress = await UserStudyProgress.find({
      user: userId,
      exam: examId,
    });

    const startDate = new Date();

    const generatedTasks = generateStudyTasks({
      preparationLevel: level,
      dailyStudyHours: hours,
      exam,
      startDate,
      userProgress,
    });

    const targetDate = getExamTargetDate(exam);

    // -------------------------------------------------
    // REGENERATE EXISTING PLAN
    // -------------------------------------------------

    if (existingPlan) {
      const existingTasks = existingPlan.tasks || [];

      const taskGroups = new Map();

      existingTasks.forEach((task) => {
        const key = getTaskTopicKey(task);

        task.topicKey = key;

        if (!taskGroups.has(key)) {
          taskGroups.set(key, []);
        }

        taskGroups.get(key).push(task);
      });

      const matchedTaskIds = new Set();

      const mergedTasks = generatedTasks.map(
        (generatedTask) => {
          const key = getTaskTopicKey(generatedTask);
          const matchingTasks = taskGroups.get(key) || [];

          const oldTask = matchingTasks.shift();

          if (!oldTask) {
            return generatedTask;
          }

          const oldTaskId = getTaskId(oldTask);

          if (oldTaskId) {
            matchedTaskIds.add(oldTaskId);
          }

          const oldProgress = getTaskProgress(oldTask);

          const mergedTask = {
            ...generatedTask.toObject?.() || generatedTask,
            _id: oldTask._id,
            topicKey: key,
            progress: oldProgress,
            status:
              oldTask.status ||
              generatedTask.status,
          };

          // Preserve completed task data.
          if (oldTask.status === "Completed" || oldProgress >= 100) {
            mergedTask.status = "Completed";
            mergedTask.progress = 100;
          }

          return mergedTask;
        }
      );

      // Keep completed tasks that are absent from
      // the newly generated schedule.
      const unmatchedCompletedTasks = existingTasks.filter(
        (task) => {
          const taskId = getTaskId(task);

          return (
            (task.status === "Completed" ||
              getTaskProgress(task) >= 100) &&
            taskId &&
            !matchedTaskIds.has(taskId)
          );
        }
      );

      existingPlan.preparationLevel = level;
      existingPlan.dailyStudyHours = hours;
      existingPlan.startDate = startDate;
      existingPlan.targetDate = targetDate;
      existingPlan.tasks = [
        ...mergedTasks,
        ...unmatchedCompletedTasks,
      ];
      existingPlan.isActive = true;

      await existingPlan.save();
      await existingPlan.populate("exam");

      return res.status(200).json({
        message: "Study plan regenerated successfully.",
        studyPlan: existingPlan,
      });
    }

    // -------------------------------------------------
    // CREATE NEW PLAN
    // -------------------------------------------------

    const studyPlan = await StudyPlan.create({
      user: userId,
      exam: examId,
      preparationLevel: level,
      dailyStudyHours: hours,
      startDate,
      targetDate,
      tasks: generatedTasks,
      isActive: true,
    });

    await studyPlan.populate("exam");

    return res.status(201).json({
      message: "Study plan created successfully.",
      studyPlan,
    });
  } catch (error) {
    console.error("Create study plan error:", error);

    return res.status(500).json({
      message: "Server error creating study plan.",
    });
  }
};

// =====================================================
// GET MY STUDY PLANS
// =====================================================

const getMyStudyPlans = async (req, res) => {
  try {
    const studyPlans = await StudyPlan.find({
      user: req.user.userId,
      isActive: true,
    })
      .populate("exam")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      studyPlans,
    });
  } catch (error) {
    console.error("Get study plans error:", error);

    return res.status(500).json({
      message: "Server error fetching study plans.",
    });
  }
};

// =====================================================
// GET STUDY PLAN BY ID
// =====================================================

const getStudyPlanById = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate("exam");

    if (!studyPlan) {
      return res.status(404).json({
        message: "Study plan not found.",
      });
    }

    return res.status(200).json({
      studyPlan,
    });
  } catch (error) {
    console.error("Get study plan error:", error);

    return res.status(500).json({
      message: "Server error fetching study plan.",
    });
  }
};

// =====================================================
// UPDATE STUDY TASK PROGRESS
// =====================================================

const updateStudyTask = async (req, res) => {
  try {
    const { status, progress } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status.",
      });
    }

    if (
      progress !== undefined &&
      (!Number.isFinite(Number(progress)) ||
        Number(progress) < 0 ||
        Number(progress) > 100)
    ) {
      return res.status(400).json({
        message: "Progress must be between 0 and 100.",
      });
    }

    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!studyPlan) {
      return res.status(404).json({
        message: "Study plan not found.",
      });
    }

    const task = studyPlan.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Study task not found.",
      });
    }

    const numericProgress =
      progress !== undefined
        ? Number(progress)
        : status === "Completed"
          ? 100
          : status === "Pending"
            ? 0
            : getTaskProgress(task);

    task.progress = numericProgress;

    if (numericProgress >= 100) {
      task.status = "Completed";
    } else if (numericProgress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    const topicKey = getTaskTopicKey(task);
    task.topicKey = topicKey;

    // -------------------------------------------------
    // CALCULATE TOPIC-LEVEL PROGRESS
    // -------------------------------------------------

    const relatedTasks = studyPlan.tasks.filter(
      (item) => getTaskTopicKey(item) === topicKey
    );

    const totalDuration = relatedTasks.reduce(
      (sum, item) =>
        sum + Number(item.durationMinutes || 0),
      0
    );

    const completedDuration = relatedTasks.reduce(
      (sum, item) => {
        const itemProgress = getTaskProgress(item);
        const duration = Number(item.durationMinutes || 0);

        return sum + duration * (itemProgress / 100);
      },
      0
    );

    const topicProgress =
      totalDuration > 0
        ? Math.round(
            (completedDuration / totalDuration) * 100
          )
        : numericProgress;

    const topicStatus = getProgressStatus(topicProgress);

    if (topicStatus === "Completed") {
      relatedTasks.forEach((item) => {
        item.status = "Completed";
        item.progress = 100;
      });
    }

    // -------------------------------------------------
    // SAVE USER TOPIC PROGRESS
    // -------------------------------------------------

    const userId = req.user.userId;
    const examId = studyPlan.exam._id || studyPlan.exam;
    const subject = task.subject;
    const topicSlug = getTopicSlugFromKey(topicKey);

    const subjectProgressRecords =
      await UserStudyProgress.find({
        user: userId,
        exam: examId,
        subject,
      });

    const existingProgress = subjectProgressRecords.find(
      (record) => {
        if (record.topicKey) {
          return (
            String(record.topicKey)
              .trim()
              .toLowerCase() === topicKey
          );
        }

        return (
          createTopicKey(record.subject, record.topic) === topicKey ||
          normalizeKeyPart(record.topic) === topicSlug
        );
      }
    );

    const progressData = {
      subject,
      topic: topicSlug,
      topicKey,
      status: topicStatus,
      progress: topicProgress,
      lastStudiedAt: new Date(),
      priority:
        topicStatus === "Completed"
          ? "Low"
          : topicStatus === "In Progress"
            ? "High"
            : task.priority || "Medium",
      completedAt:
        topicStatus === "Completed"
          ? new Date()
          : null,
    };

    let savedProgress;

    if (existingProgress) {
      existingProgress.set(progressData);
      savedProgress = await existingProgress.save();
    } else {
      savedProgress = await UserStudyProgress.create({
        user: userId,
        exam: examId,
        ...progressData,
        studyTimeMinutes: 0,
      });
    }

    await studyPlan.save();
    await studyPlan.populate("exam");

    return res.status(200).json({
      message: "Study progress updated successfully.",
      studyPlan,
      topicProgress: {
        topicKey,
        progress: topicProgress,
        status: topicStatus,
      },
      savedProgress,
    });
  } catch (error) {
    console.error("Update study task error:", error);

    return res.status(500).json({
      message: "Server error updating study task.",
    });
  }
};

// =====================================================
// DELETE STUDY PLAN
// =====================================================

const deleteStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!studyPlan) {
      return res.status(404).json({
        message: "Study plan not found.",
      });
    }

    studyPlan.isActive = false;

    await studyPlan.save();

    return res.status(200).json({
      message: "Study plan deleted successfully.",
    });
  } catch (error) {
    console.error("Delete study plan error:", error);

    return res.status(500).json({
      message: "Server error deleting study plan.",
    });
  }
};

module.exports = {
  createStudyPlan,
  getMyStudyPlans,
  getStudyPlanById,
  updateStudyTask,
  deleteStudyPlan,
};