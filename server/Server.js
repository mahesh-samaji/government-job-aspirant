const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const examRoutes = require("./routes/examRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { startJobScheduler } = require("./services/jobScheduler");
const { startExamScheduler } = require("./services/examScheduler");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/roadmaps", roadmapRoutes);

startJobScheduler();

startExamScheduler();


app.get("/", (req, res) => {
  res.send("GovPrep Backend Server is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});