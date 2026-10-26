const express = require("express");

const {
  getAllNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// =====================================================
router.get(
  "/",
  authMiddleware,
  getAllNotifications
);

// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadNotificationCount
);

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// IMPORTANT: Keep this BEFORE /:id/read
// =====================================================
router.patch(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================
router.patch(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

module.exports = router;