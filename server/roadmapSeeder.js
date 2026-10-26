
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Roadmap = require("./models/Roadmap");

const roadmaps = [
  {
    title: "SSC CGL Preparation",
    description: "A structured roadmap for SSC CGL preparation.",
    duration: "6 months",
    category: "ssc",
    steps: [
      { stepNumber: 1, title: "Understand the Exam", description: "Review eligibility, exam pattern, and syllabus." },
      { stepNumber: 2, title: "Build Fundamentals", description: "Study mathematics, reasoning, English, and general awareness." },
      { stepNumber: 3, title: "Topic-wise Practice", description: "Practice questions and review mistakes." },
      { stepNumber: 4, title: "Previous-Year Papers", description: "Solve previous-year questions under timed conditions." },
      { stepNumber: 5, title: "Mock Tests", description: "Take full-length tests and analyze performance." },
      { stepNumber: 6, title: "Final Revision", description: "Revise formulas, vocabulary, and important topics." },
    ],
  },
  {
    title: "Banking Exams Preparation",
    description: "Prepare for banking recruitment examinations.",
    duration: "4 months",
    category: "banking",
    steps: [
      { stepNumber: 1, title: "Understand the Exam", description: "Review the syllabus and selection stages." },
      { stepNumber: 2, title: "Build Core Skills", description: "Study quantitative aptitude, reasoning, and English." },
      { stepNumber: 3, title: "Banking Awareness", description: "Learn banking concepts and current affairs." },
      { stepNumber: 4, title: "Practice Questions", description: "Solve previous-year papers and sectional tests." },
      { stepNumber: 5, title: "Mock Tests", description: "Improve accuracy, speed, and time management." },
      { stepNumber: 6, title: "Revision", description: "Review weak topics and current affairs." },
    ],
  },
  {
    title: "Railway Exams Preparation",
    description: "Prepare for RRB NTPC, Group D, and related exams.",
    duration: "5 months",
    category: "railway",
    steps: [
      { stepNumber: 1, title: "Understand the Exam", description: "Review the relevant RRB notification and syllabus." },
      { stepNumber: 2, title: "Mathematics", description: "Practice arithmetic and required mathematics topics." },
      { stepNumber: 3, title: "Reasoning", description: "Practice logical reasoning and analytical questions." },
      { stepNumber: 4, title: "General Awareness", description: "Study general knowledge, current affairs, and relevant science." },
      { stepNumber: 5, title: "Previous-Year Papers", description: "Practice previous railway exam questions." },
      { stepNumber: 6, title: "Mocks and Revision", description: "Take timed tests and revise difficult topics." },
    ],
  },
  {
    title: "UPSC Civil Services Preparation",
    description: "Build a foundation for UPSC Civil Services preparation.",
    duration: "12 months",
    category: "upsc",
    steps: [
      { stepNumber: 1, title: "Understand the Syllabus", description: "Study the official syllabus and examination stages." },
      { stepNumber: 2, title: "Build Foundations", description: "Study relevant NCERT subjects and core concepts." },
      { stepNumber: 3, title: "Standard Books", description: "Cover polity, history, geography, economy, and environment." },
      { stepNumber: 4, title: "Current Affairs", description: "Follow reliable news sources and prepare notes." },
      { stepNumber: 5, title: "Prelims Practice", description: "Solve MCQs and previous-year papers." },
      { stepNumber: 6, title: "Mains Answer Writing", description: "Practice structured answers and essays." },
      { stepNumber: 7, title: "Revision and Mock Tests", description: "Revise regularly and take exam-style tests." },
    ],
  },
  {
    title: "Defence Exams Preparation",
    description: "Prepare for eligible defence recruitment examinations.",
    duration: "6 months",
    category: "defence",
    steps: [
      { stepNumber: 1, title: "Choose the Exam", description: "Check the official eligibility requirements." },
      { stepNumber: 2, title: "Understand the Syllabus", description: "Review the examination pattern and subjects." },
      { stepNumber: 3, title: "Academic Preparation", description: "Study required mathematics, English, and general knowledge." },
      { stepNumber: 4, title: "Physical Preparation", description: "Follow a safe fitness routine suitable for the recruitment." },
      { stepNumber: 5, title: "Practice Papers", description: "Solve previous-year papers and mock tests." },
      { stepNumber: 6, title: "Final Revision", description: "Revise subjects and review the selection process." },
    ],
  },
  {
    title: "State Government Exams Preparation",
    description: "Prepare for state-level public service and recruitment exams.",
    duration: "6 months",
    category: "state",
    steps: [
      { stepNumber: 1, title: "Choose Your Exam", description: "Review official notifications, eligibility, and syllabus." },
      { stepNumber: 2, title: "General Studies", description: "Study history, geography, polity, economy, and science." },
      { stepNumber: 3, title: "State-Specific Topics", description: "Study state history, geography, culture, and relevant policies." },
      { stepNumber: 4, title: "Aptitude Practice", description: "Practice reasoning, mathematics, and required language topics." },
      { stepNumber: 5, title: "Previous Papers and Mocks", description: "Practice relevant previous papers and mock tests." },
      { stepNumber: 6, title: "Final Revision", description: "Review current affairs and weak topics." },
    ],
  },
];

async function seedRoadmaps() {
  try {
    console.log("Starting roadmap seeder...");

    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const roadmapData of roadmaps) {
      const existing = await Roadmap.findOne({
        category: roadmapData.category,
      });

      if (existing) {
        console.log(`Skipped existing roadmap: ${roadmapData.title}`);
        skipped++;
        continue;
      }

      await Roadmap.create(roadmapData);
      console.log(`Inserted roadmap: ${roadmapData.title}`);
      inserted++;
    }

    console.log("\nRoadmap seeding completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error("Roadmap seeder failed:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

seedRoadmaps();
