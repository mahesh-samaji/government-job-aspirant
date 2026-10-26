const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const Notification = require("./models/Notification");
const User = require("./models/user");

const seedNotifications = async () => {
  try {
    await connectDB();

    // Find an existing candidate user
    const user = await User.findOne({
      role: "candidate",
    });

    if (!user) {
      throw new Error(
        "No candidate user found. Please register a user first."
      );
    }

    console.log(`Using user: ${user.name} (${user.email})`);

    const notifications = [
      {
        user: user._id,
        title: "New Government Job Available",
        message:
          "A new government job opportunity has been added to GovPrep.",
        type: "job",
        link: "/jobs",
        isRead: false,
        isActive: true,
      },
      {
        user: user._id,
        title: "Exam Reminder",
        message:
          "An upcoming government examination is approaching. Check the exam details and prepare accordingly.",
        type: "exam",
        link: "/exams",
        isRead: false,
        isActive: true,
      },
      {
        user: user._id,
        title: "Application Deadline",
        message:
          "An important government job application deadline is approaching.",
        type: "deadline",
        link: "/jobs",
        isRead: false,
        isActive: true,
      },
      {
        user: user._id,
        title: "Study Plan Reminder",
        message:
          "Continue your preparation and complete today's scheduled study tasks.",
        type: "general",
        link: "/study-plan",
        isRead: false,
        isActive: true,
      },
    ];

    // Remove existing notifications
    await Notification.deleteMany({});

    // Insert new notifications
    const insertedNotifications =
      await Notification.insertMany(notifications);

    console.log(
      `Successfully inserted ${insertedNotifications.length} notifications.`
    );

    insertedNotifications.forEach((notification) => {
      console.log(
        `${notification.title} - ${notification.type}`
      );
    });

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Notification seed error:",
      error.message
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedNotifications();