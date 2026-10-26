
const examSyllabus = {
  // =====================================================
  // SSC
  // =====================================================
  SSC: [
    {
      subject: "Quantitative Aptitude",
      weightage: 25,
      topics: [
        { name: "Number System", estimatedMinutes: 180 },
        { name: "Percentage", estimatedMinutes: 120 },
        { name: "Profit and Loss", estimatedMinutes: 150 },
        { name: "Ratio and Proportion", estimatedMinutes: 120 },
        { name: "Average", estimatedMinutes: 90 },
        { name: "Time and Work", estimatedMinutes: 150 },
        { name: "Time, Speed and Distance", estimatedMinutes: 150 },
        { name: "Simple and Compound Interest", estimatedMinutes: 120 },
        { name: "Algebra", estimatedMinutes: 180 },
        { name: "Geometry", estimatedMinutes: 180 },
        { name: "Mensuration", estimatedMinutes: 150 },
        { name: "Data Interpretation", estimatedMinutes: 150 },
      ],
    },
    {
      subject: "Reasoning",
      weightage: 25,
      topics: [
        { name: "Analogy", estimatedMinutes: 90 },
        { name: "Classification", estimatedMinutes: 90 },
        { name: "Number Series", estimatedMinutes: 120 },
        { name: "Coding-Decoding", estimatedMinutes: 120 },
        { name: "Blood Relations", estimatedMinutes: 90 },
        { name: "Direction Sense", estimatedMinutes: 90 },
        { name: "Syllogism", estimatedMinutes: 120 },
        { name: "Venn Diagrams", estimatedMinutes: 90 },
        { name: "Statement and Conclusion", estimatedMinutes: 120 },
        { name: "Non-Verbal Reasoning", estimatedMinutes: 150 },
      ],
    },
    {
      subject: "English",
      weightage: 25,
      topics: [
        { name: "Grammar", estimatedMinutes: 180 },
        { name: "Vocabulary", estimatedMinutes: 150 },
        { name: "Synonyms and Antonyms", estimatedMinutes: 90 },
        { name: "Error Detection", estimatedMinutes: 120 },
        { name: "Sentence Improvement", estimatedMinutes: 120 },
        { name: "Reading Comprehension", estimatedMinutes: 150 },
        { name: "Cloze Test", estimatedMinutes: 120 },
        { name: "One Word Substitution", estimatedMinutes: 90 },
      ],
    },
    {
      subject: "General Awareness",
      weightage: 25,
      topics: [
        { name: "Indian History", estimatedMinutes: 180 },
        { name: "Indian Geography", estimatedMinutes: 150 },
        { name: "Indian Polity", estimatedMinutes: 150 },
        { name: "Indian Economy", estimatedMinutes: 150 },
        { name: "General Science", estimatedMinutes: 180 },
        { name: "Current Affairs", estimatedMinutes: 180 },
      ],
    },
  ],

  // =====================================================
  // UPSC
  // =====================================================
  UPSC: [
    {
      subject: "History",
      weightage: 20,
      topics: [
        { name: "Ancient Indian History", estimatedMinutes: 300 },
        { name: "Medieval Indian History", estimatedMinutes: 240 },
        { name: "Modern Indian History", estimatedMinutes: 360 },
        { name: "Indian National Movement", estimatedMinutes: 300 },
        { name: "Post Independence India", estimatedMinutes: 240 },
      ],
    },
    {
      subject: "Geography",
      weightage: 20,
      topics: [
        { name: "Physical Geography", estimatedMinutes: 300 },
        { name: "Indian Geography", estimatedMinutes: 300 },
        { name: "World Geography", estimatedMinutes: 240 },
        { name: "Indian Resources", estimatedMinutes: 180 },
        { name: "Environment and Ecology", estimatedMinutes: 360 },
      ],
    },
    {
      subject: "Indian Polity",
      weightage: 20,
      topics: [
        { name: "Constitution", estimatedMinutes: 360 },
        { name: "Fundamental Rights", estimatedMinutes: 240 },
        { name: "Parliament", estimatedMinutes: 300 },
        { name: "Judiciary", estimatedMinutes: 240 },
        { name: "Federalism", estimatedMinutes: 240 },
        { name: "Constitutional Bodies", estimatedMinutes: 240 },
        { name: "Governance", estimatedMinutes: 300 },
      ],
    },
    {
      subject: "Economy",
      weightage: 15,
      topics: [
        { name: "Indian Economy Basics", estimatedMinutes: 300 },
        { name: "Banking", estimatedMinutes: 240 },
        { name: "Inflation", estimatedMinutes: 180 },
        { name: "Fiscal Policy", estimatedMinutes: 240 },
        { name: "Monetary Policy", estimatedMinutes: 240 },
        { name: "Budget", estimatedMinutes: 180 },
        { name: "Economic Development", estimatedMinutes: 300 },
      ],
    },
    {
      subject: "Current Affairs",
      weightage: 15,
      topics: [
        { name: "National Current Affairs", estimatedMinutes: 300 },
        { name: "International Current Affairs", estimatedMinutes: 240 },
        { name: "Government Schemes", estimatedMinutes: 240 },
        { name: "Science and Technology", estimatedMinutes: 300 },
        { name: "Environment", estimatedMinutes: 240 },
      ],
    },
    {
      subject: "CSAT",
      weightage: 10,
      topics: [
        { name: "Logical Reasoning", estimatedMinutes: 240 },
        { name: "Data Interpretation", estimatedMinutes: 240 },
        { name: "Basic Numeracy", estimatedMinutes: 300 },
        { name: "Reading Comprehension", estimatedMinutes: 300 },
        { name: "Decision Making", estimatedMinutes: 180 },
      ],
    },
  ],

  // =====================================================
  // RRB
  // =====================================================
  RRB: [
    {
      subject: "Mathematics",
      weightage: 30,
      topics: [
        { name: "Number System", estimatedMinutes: 180 },
        { name: "Percentage", estimatedMinutes: 120 },
        { name: "Ratio and Proportion", estimatedMinutes: 120 },
        { name: "Average", estimatedMinutes: 90 },
        { name: "Profit and Loss", estimatedMinutes: 150 },
        { name: "Time and Work", estimatedMinutes: 150 },
        { name: "Time and Distance", estimatedMinutes: 150 },
        { name: "Algebra", estimatedMinutes: 180 },
        { name: "Geometry", estimatedMinutes: 180 },
        { name: "Data Interpretation", estimatedMinutes: 150 },
      ],
    },
    {
      subject: "General Intelligence and Reasoning",
      weightage: 30,
      topics: [
        { name: "Analogy", estimatedMinutes: 90 },
        { name: "Coding-Decoding", estimatedMinutes: 120 },
        { name: "Series", estimatedMinutes: 120 },
        { name: "Syllogism", estimatedMinutes: 120 },
        { name: "Blood Relations", estimatedMinutes: 90 },
        { name: "Direction Sense", estimatedMinutes: 90 },
        { name: "Classification", estimatedMinutes: 90 },
        { name: "Venn Diagrams", estimatedMinutes: 90 },
      ],
    },
    {
      subject: "General Awareness",
      weightage: 20,
      topics: [
        { name: "Current Affairs", estimatedMinutes: 240 },
        { name: "Indian History", estimatedMinutes: 180 },
        { name: "Indian Geography", estimatedMinutes: 150 },
        { name: "Indian Polity", estimatedMinutes: 150 },
        { name: "Indian Economy", estimatedMinutes: 150 },
      ],
    },
    {
      subject: "General Science",
      weightage: 20,
      topics: [
        { name: "Physics", estimatedMinutes: 240 },
        { name: "Chemistry", estimatedMinutes: 240 },
        { name: "Biology", estimatedMinutes: 240 },
        { name: "Basic Science", estimatedMinutes: 180 },
      ],
    },
  ],

  // =====================================================
  // TGPSC
  // =====================================================
  TGPSC: [
    {
      subject: "Telangana History",
      weightage: 25,
      topics: [
        { name: "Ancient Telangana", estimatedMinutes: 180 },
        { name: "Medieval Telangana", estimatedMinutes: 180 },
        { name: "Modern Telangana", estimatedMinutes: 240 },
        { name: "Telangana Movement", estimatedMinutes: 300 },
        { name: "Formation of Telangana", estimatedMinutes: 180 },
      ],
    },
    {
      subject: "Telangana Geography",
      weightage: 20,
      topics: [
        { name: "Telangana Geography", estimatedMinutes: 180 },
        { name: "Rivers", estimatedMinutes: 150 },
        { name: "Agriculture", estimatedMinutes: 180 },
        { name: "Natural Resources", estimatedMinutes: 150 },
        { name: "Climate", estimatedMinutes: 120 },
      ],
    },
    {
      subject: "Indian Polity",
      weightage: 20,
      topics: [
        { name: "Indian Constitution", estimatedMinutes: 240 },
        { name: "Fundamental Rights", estimatedMinutes: 180 },
        { name: "Parliament", estimatedMinutes: 180 },
        { name: "Judiciary", estimatedMinutes: 180 },
        { name: "Federalism", estimatedMinutes: 180 },
      ],
    },
    {
      subject: "Economy",
      weightage: 15,
      topics: [
        { name: "Indian Economy", estimatedMinutes: 240 },
        { name: "Telangana Economy", estimatedMinutes: 240 },
        { name: "Budget", estimatedMinutes: 180 },
        { name: "Development Programs", estimatedMinutes: 180 },
      ],
    },
    {
      subject: "Current Affairs",
      weightage: 20,
      topics: [
        { name: "National Current Affairs", estimatedMinutes: 240 },
        { name: "Telangana Current Affairs", estimatedMinutes: 300 },
        { name: "Government Schemes", estimatedMinutes: 180 },
        { name: "Science and Technology", estimatedMinutes: 180 },
      ],
    },
  ],

  // =====================================================
  // POLICE
  // =====================================================
  POLICE: [
    {
      subject: "Arithmetic",
      weightage: 30,
      topics: [
        { name: "Number System", estimatedMinutes: 150 },
        { name: "Percentage", estimatedMinutes: 120 },
        { name: "Ratio", estimatedMinutes: 120 },
        { name: "Average", estimatedMinutes: 90 },
        { name: "Profit and Loss", estimatedMinutes: 150 },
        { name: "Time and Work", estimatedMinutes: 150 },
        { name: "Time and Distance", estimatedMinutes: 150 },
      ],
    },
    {
      subject: "Reasoning",
      weightage: 30,
      topics: [
        { name: "Analogy", estimatedMinutes: 90 },
        { name: "Series", estimatedMinutes: 120 },
        { name: "Coding-Decoding", estimatedMinutes: 120 },
        { name: "Blood Relations", estimatedMinutes: 90 },
        { name: "Direction Sense", estimatedMinutes: 90 },
        { name: "Syllogism", estimatedMinutes: 120 },
      ],
    },
    {
      subject: "General Studies",
      weightage: 25,
      topics: [
        { name: "Indian History", estimatedMinutes: 180 },
        { name: "Indian Geography", estimatedMinutes: 150 },
        { name: "Indian Polity", estimatedMinutes: 180 },
        { name: "Indian Economy", estimatedMinutes: 150 },
        { name: "General Science", estimatedMinutes: 180 },
        { name: "Current Affairs", estimatedMinutes: 240 },
      ],
    },
    {
      subject: "Telangana",
      weightage: 15,
      topics: [
        { name: "Telangana History", estimatedMinutes: 180 },
        { name: "Telangana Movement", estimatedMinutes: 240 },
        { name: "Telangana Geography", estimatedMinutes: 180 },
        { name: "Telangana Economy", estimatedMinutes: 180 },
        { name: "Telangana Government Schemes", estimatedMinutes: 180 },
      ],
    },
  ],
};

// =====================================================
// FIND SYLLABUS FOR EXAM
// =====================================================
const getExamSyllabus = (exam) => {
  if (!exam) {
    return [];
  }

  // Prefer syllabus saved directly on the exam document.
  if (
    Array.isArray(exam.syllabus) &&
    exam.syllabus.length > 0
  ) {
    return exam.syllabus;
  }

  const name = (exam.name || "").toUpperCase();
  const organization = (
    exam.organization || ""
  ).toUpperCase();
  const category = (
    exam.category || ""
  ).toUpperCase();

  if (
    name.includes("UPSC") ||
    organization.includes("UPSC") ||
    category.includes("UPSC")
  ) {
    return examSyllabus.UPSC;
  }

  if (
    name.includes("SSC") ||
    organization.includes("SSC") ||
    category.includes("SSC")
  ) {
    return examSyllabus.SSC;
  }

  if (
    name.includes("RRB") ||
    name.includes("RAILWAY") ||
    organization.includes("RAILWAY") ||
    organization.includes("RRB") ||
    category.includes("RRB") ||
    category.includes("RAILWAY")
  ) {
    return examSyllabus.RRB;
  }

  if (
    name.includes("TGPSC") ||
    name.includes("TSPSC") ||
    organization.includes("TGPSC") ||
    organization.includes("TSPSC") ||
    category.includes("TGPSC") ||
    category.includes("TSPSC")
  ) {
    return examSyllabus.TGPSC;
  }

  if (
    name.includes("POLICE") ||
    category.includes("POLICE") ||
    organization.includes("POLICE")
  ) {
    return examSyllabus.POLICE;
  }

  return [];
};

module.exports = {
  examSyllabus,
  getExamSyllabus,
};