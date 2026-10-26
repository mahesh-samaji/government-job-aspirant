const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const Exam = require("./models/Exam");

const exams = [
  {
    name: "SSC CGL 2026",
    organization: "Staff Selection Commission",
    category: "SSC",
    examDate: new Date("2026-12-01"),
    applicationStartDate: new Date("2026-06-01"),
    applicationEndDate: new Date("2026-07-01"),
    notificationUrl: "https://ssc.gov.in/",
    description:
      "Combined Graduate Level examination conducted by the Staff Selection Commission.",
    isActive: true,
  },
  {
    name: "RRB NTPC 2026",
    organization: "Railway Recruitment Board",
    category: "Railway",
    examDate: new Date("2026-11-15"),
    applicationStartDate: new Date("2026-09-01"),
    applicationEndDate: new Date("2026-10-01"),
    notificationUrl: "https://www.rrbcdg.gov.in/",
    description:
      "Non-Technical Popular Categories examination conducted by the Railway Recruitment Board.",
    isActive: true,
  },
  {
    name: "UPSC Civil Services Examination 2027",
    organization: "Union Public Service Commission",
    category: "UPSC",
    examDate: new Date("2027-05-30"),
    applicationStartDate: new Date("2027-02-01"),
    applicationEndDate: new Date("2027-02-20"),
    notificationUrl: "https://upsc.gov.in/",
    description:
      "Civil Services Examination conducted by the Union Public Service Commission.",
    isActive: true,
  },
];

const seedExams = async () => {
  try {
    await connectDB();

    await Exam.deleteMany({});

    const insertedExams = await Exam.insertMany(exams);

    console.log(
      `Successfully inserted ${insertedExams.length} exams.`
    );

    insertedExams.forEach((exam) => {
      console.log(
        `${exam.name} - ${exam.examDate.toISOString()}`
      );
    });

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Exam seed error:", error.message);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedExams();