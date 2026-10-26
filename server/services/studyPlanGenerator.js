
const { getExamSyllabus } = require("./examSyllabus");

// =====================================================
// DATE HELPERS
// =====================================================

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDaysRemaining = (examDate, startDate) => {
  if (!examDate) return 30;

  const start = startOfDay(startDate);
  const end = startOfDay(examDate);

  const difference = end.getTime() - start.getTime();

  return Math.max(
    1,
    Math.ceil(difference / (1000 * 60 * 60 * 24))
  );
};

// =====================================================
// STABLE TOPIC KEY
// =====================================================

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

// =====================================================
// NORMALIZE SYLLABUS
// =====================================================

const normalizeSyllabus = (syllabus) => {
  return syllabus.map((subject) => ({
    subject: subject.subject,
    weightage: Number(subject.weightage) || 0,

    topics: (subject.topics || []).map((topic) => {
      if (typeof topic === "string") {
        return {
          name: topic,
          estimatedMinutes: 120,
        };
      }

      return {
        name: topic.name,
        estimatedMinutes:
          Number(topic.estimatedMinutes) || 120,
      };
    }),
  }));
};

// =====================================================
// PREPARATION LEVEL
// =====================================================

const getTopicPrefix = (preparationLevel) => {
  if (preparationLevel === "Beginner") {
    return "Learn and practice";
  }

  if (preparationLevel === "Intermediate") {
    return "Revise and practice";
  }

  return "Advanced practice";
};

// =====================================================
// TASK DESCRIPTION
// =====================================================

const createTaskDescription = ({
  subject,
  topic,
  preparationLevel,
  exam,
}) => {
  const examName = exam?.name || "your selected exam";

  if (preparationLevel === "Beginner") {
    return `Learn the fundamentals of ${topic} in ${subject} for ${examName}, then solve basic practice questions.`;
  }

  if (preparationLevel === "Intermediate") {
    return `Revise ${topic} in ${subject} for ${examName} and solve exam-level questions.`;
  }

  return `Practice advanced ${topic} questions in ${subject} for ${examName}, focusing on accuracy and speed.`;
};

// =====================================================
// TOPIC PRIORITY ENGINE
// =====================================================

const getTopicPriority = ({
  weightage,
  progress,
  status,
}) => {
  const normalizedProgress = Number(progress) || 0;

  if (
    status === "In Progress" ||
    (normalizedProgress > 0 && normalizedProgress < 100)
  ) {
    return {
      priority: "High",
      priorityReason:
        "This topic is partially completed and needs focused revision.",
      priorityScore: 100 + weightage,
    };
  }

  if (weightage >= 25) {
    return {
      priority: "High",
      priorityReason:
        "This subject has high planning weightage.",
      priorityScore: 80 + weightage,
    };
  }

  if (weightage >= 15) {
    return {
      priority: "Medium",
      priorityReason:
        "This subject has moderate planning weightage.",
      priorityScore: 60 + weightage,
    };
  }

  return {
    priority: "Low",
    priorityReason:
      "This subject has lower planning weightage.",
    priorityScore: 40 + weightage,
  };
};

// =====================================================
// GENERATE STUDY TASKS
// =====================================================

const generateStudyTasks = ({
  preparationLevel = "Beginner",
  dailyStudyHours,
  exam,
  startDate = new Date(),
  userProgress = [],
}) => {
  const numericHours = Number(dailyStudyHours);

  if (
    !Number.isFinite(numericHours) ||
    numericHours < 1 ||
    numericHours > 24
  ) {
    return [];
  }

  const dailyMinutes = Math.round(numericHours * 60);
  const today = startOfDay(startDate);

  const examDate = exam?.examDate
    ? new Date(exam.examDate)
    : null;

  const daysRemaining = getDaysRemaining(
    examDate,
    today
  );

  // ---------------------------------------------------
  // GET EXAM SYLLABUS
  // ---------------------------------------------------

  const rawSyllabus = getExamSyllabus(exam);

  if (!rawSyllabus.length) {
    return generateFallbackTasks({
      preparationLevel,
      dailyMinutes,
      exam,
      today,
    });
  }

  const syllabus = normalizeSyllabus(rawSyllabus);

  // ---------------------------------------------------
  // MAP USER PROGRESS USING STABLE TOPIC KEY
  // ---------------------------------------------------

  const progressMap = new Map();

  userProgress.forEach((item) => {
    const key =
      item.topicKey ||
      createTopicKey(item.subject, item.topic);

    if (!key) return;

    const normalizedKey = String(key)
      .toLowerCase()
      .trim();

    const existingProgress = progressMap.get(normalizedKey);

    // Prefer the record with greater progress if
    // duplicate legacy and newer records are encountered.
    if (
      !existingProgress ||
      Number(item.progress || 0) >
        Number(existingProgress.progress || 0)
    ) {
      progressMap.set(normalizedKey, item);
    }
  });

  // ---------------------------------------------------
  // BUILD REMAINING TOPICS
  // ---------------------------------------------------

  const remainingTopics = [];

  syllabus.forEach((subject) => {
    subject.topics.forEach((topic) => {
      const topicKey = createTopicKey(
        subject.subject,
        topic.name
      );

      const savedProgress = progressMap.get(
        topicKey.toLowerCase()
      );

      const currentProgress = Math.min(
        100,
        Math.max(
          0,
          Number(savedProgress?.progress) || 0
        )
      );

      // Skip completed topics.
      if (
        savedProgress?.status === "Completed" ||
        currentProgress >= 100
      ) {
        return;
      }

      const remainingRatio =
        Math.max(0, 100 - currentProgress) / 100;

      const remainingMinutes = Math.max(
        15,
        Math.ceil(
          topic.estimatedMinutes * remainingRatio
        )
      );

      const priorityInfo = getTopicPriority({
        weightage: subject.weightage,
        progress: currentProgress,
        status: savedProgress?.status,
      });

      remainingTopics.push({
        subject: subject.subject,
        topic: topic.name,
        topicKey,
        weightage: subject.weightage,
        estimatedMinutes: remainingMinutes,
        progress: currentProgress,
        priority: priorityInfo.priority,
        priorityReason: priorityInfo.priorityReason,
        priorityScore: priorityInfo.priorityScore,
      });
    });
  });

  if (!remainingTopics.length) {
    return [];
  }

  // ---------------------------------------------------
  // SORT BY PRIORITY SCORE
  // ---------------------------------------------------

  remainingTopics.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return b.estimatedMinutes - a.estimatedMinutes;
  });

  // ---------------------------------------------------
  // WORKLOAD CALCULATION
  // ---------------------------------------------------

  const totalRemainingMinutes =
    remainingTopics.reduce(
      (total, topic) => total + topic.estimatedMinutes,
      0
    );

  const availableMinutes =
    daysRemaining * dailyMinutes;

  // ---------------------------------------------------
  // DAILY SCHEDULING
  // ---------------------------------------------------

  const tasks = [];

  let currentDay = 0;
  let minutesUsedToday = 0;

  for (const item of remainingTopics) {
    let minutesLeft = item.estimatedMinutes;
    let completedBlockMinutes = 0;

    while (minutesLeft > 0) {
      if (currentDay >= daysRemaining) {
        break;
      }

      const availableToday =
        dailyMinutes - minutesUsedToday;

      if (availableToday <= 0) {
        currentDay += 1;
        minutesUsedToday = 0;
        continue;
      }

      const allocatedMinutes = Math.min(
        minutesLeft,
        availableToday
      );

      completedBlockMinutes += allocatedMinutes;

      const completionPercent = Math.min(
        100,
        Math.round(
          (completedBlockMinutes / item.estimatedMinutes) * 100
        )
      );

      const topicLabel =
        item.estimatedMinutes > allocatedMinutes
          ? `${getTopicPrefix(preparationLevel)}: ${item.topic} (${completionPercent}% of planned study time)`
          : `${getTopicPrefix(preparationLevel)}: ${item.topic}`;

      tasks.push({
        subject: item.subject,

        topicKey: item.topicKey,

        topic: topicLabel,

        description: createTaskDescription({
          subject: item.subject,
          topic: item.topic,
          preparationLevel,
          exam,
        }),

        durationMinutes: allocatedMinutes,
        weightage: item.weightage,
        priority: item.priority,
        priorityReason: item.priorityReason,

        status: "Pending",
        progress: 0,

        scheduledDate: addDays(today, currentDay),
      });

      minutesLeft -= allocatedMinutes;
      minutesUsedToday += allocatedMinutes;

      if (minutesUsedToday >= dailyMinutes) {
        currentDay += 1;
        minutesUsedToday = 0;
      }
    }
  }

  // ---------------------------------------------------
  // MOCK TEST
  // ---------------------------------------------------

  if (
    dailyMinutes >= 180 &&
    currentDay < daysRemaining
  ) {
    const availableToday =
      dailyMinutes - minutesUsedToday;

    if (availableToday >= 30) {
      tasks.push({
        subject: "Mock Test",

        topicKey: "mock-test::general-practice",

        topic: `${exam?.name || "Government Exam"} practice test`,

        description:
          "Complete a timed practice test and review your mistakes.",

        durationMinutes: 30,
        weightage: 0,
        priority: "Medium",

        priorityReason:
          "Practice tests help assess preparation and identify weak areas.",

        status: "Pending",
        progress: 0,

        scheduledDate: addDays(today, currentDay),
      });
    }
  }

  // ---------------------------------------------------
  // SCHEDULING METADATA
  // ---------------------------------------------------

  tasks.totalRemainingMinutes = totalRemainingMinutes;
  tasks.availableMinutes = availableMinutes;
  tasks.daysRemaining = daysRemaining;

  tasks.isWorkloadFeasible =
    totalRemainingMinutes <= availableMinutes;

  return tasks;
};

// =====================================================
// FALLBACK GENERATOR
// =====================================================

const generateFallbackTasks = ({
  preparationLevel,
  dailyMinutes,
  exam,
  today,
}) => {
  const fallbackSubjects = [
    "General Awareness",
    "Reasoning",
    "Quantitative Aptitude",
  ];

  return fallbackSubjects.map((subject, index) => ({
    subject,

    topicKey: `${normalizeKeyPart(subject)}::important-concepts`,

    topic: `${getTopicPrefix(preparationLevel)}: Important concepts`,

    description: `Prepare ${subject} for ${
      exam?.name || "your selected exam"
    }. Add an official structured syllabus to enable topic-level scheduling.`,

    durationMinutes: Math.floor(
      dailyMinutes / fallbackSubjects.length
    ),

    weightage: 0,
    priority: "Medium",

    priorityReason:
      "Fallback task because structured exam syllabus is unavailable.",

    status: "Pending",
    progress: 0,

    scheduledDate: addDays(
      today,
      Math.floor(index / 2)
    ),
  }));
};

module.exports = {
  generateStudyTasks,
};