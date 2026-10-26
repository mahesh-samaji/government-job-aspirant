const Notification = require("../models/Notification");
const User = require("../models/user");

// =====================================================
// CREATE NOTIFICATIONS FOR A NEW JOB
// =====================================================
const createJobNotifications = async (job) => {
  try {
    if (!job || !job._id) {
      console.log(
        "Job notification skipped: invalid job data."
      );

      return {
        success: false,
        created: 0,
      };
    }

    // ----------------------------------------
    // FIND ALL CANDIDATE USERS
    // ----------------------------------------
    const users = await User.find({
      role: "candidate",
    }).select("_id");

    if (users.length === 0) {
      console.log(
        "No candidate users found for job notification."
      );

      return {
        success: true,
        created: 0,
      };
    }

    let createdCount = 0;

    // ----------------------------------------
    // CREATE NOTIFICATION FOR EACH USER
    // ----------------------------------------
    for (const user of users) {
      const existingNotification =
        await Notification.findOne({
          user: user._id,
          type: "job",
          link: `/jobs/${job._id}`,
        });

      // ----------------------------------------
      // PREVENT DUPLICATE NOTIFICATIONS
      // ----------------------------------------
      if (existingNotification) {
        continue;
      }

      await Notification.create({
        user: user._id,
        title: "New Government Job Available",
        message: `${job.title} at ${job.organization} has been added to GovPrep.`,
        type: "job",
        link: `/jobs/${job._id}`,
        isRead: false,
        isActive: true,
      });

      createdCount++;
    }

    console.log(
      `Created ${createdCount} notification(s) for job: ${job.title}`
    );

    return {
      success: true,
      created: createdCount,
    };
  } catch (error) {
    console.error(
      "Create job notifications error:",
      error.message
    );

    return {
      success: false,
      created: 0,
      error: error.message,
    };
  }
};

module.exports = {
  createJobNotifications,
};