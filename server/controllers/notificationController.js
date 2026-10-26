const Notification = require("../models/Notification");

// =====================================================
// GET ALL ACTIVE NOTIFICATIONS FOR LOGGED-IN USER
// =====================================================
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Notifications fetched successfully.",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// =====================================================
// GET UNREAD NOTIFICATION COUNT FOR LOGGED-IN USER
// =====================================================
const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.userId,
      isActive: true,
      isRead: false,
    });

    return res.status(200).json({
      message:
        "Unread notification count fetched successfully.",
      count,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        user: req.user.userId,
        isActive: true,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: req.user.userId,
        isActive: true,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
};