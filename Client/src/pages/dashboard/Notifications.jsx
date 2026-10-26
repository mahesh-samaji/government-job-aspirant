
import React, { useEffect, useState } from "react";
import { FaCheckDouble, FaBell, FaSpinner } from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";
import NotificationList from "../../components/notifications/NotificationList";

const API_URL = "http://localhost:5000";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  // =====================================================
  // FETCH USER-SPECIFIC NOTIFICATIONS
  // =====================================================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch notifications."
          );
        }

        setNotifications(data.notifications || []);
      } catch (error) {
        console.error(
          "Fetch notifications error:",
          error
        );

        setError(
          error.message ||
            "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // =====================================================
  // UNREAD COUNT
  // =====================================================
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // =====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =====================================================
  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notifications as read."
        );
      }

      // Update UI after backend succeeds
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      setError(
        error.message ||
          "Unable to mark notifications as read."
      );
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // =====================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =====================================================
  const handleNotificationClick = async (notification) => {
    // Already read, so no API request is needed
    if (notification.isRead) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/notifications/${notification._id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read."
        );
      }

      // Update UI after backend succeeds
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );

      setError(
        error.message ||
          "Unable to mark notification as read."
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with government jobs, exams, deadlines, and preparation reminders."
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAllAsRead}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {markingAllAsRead ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheckDouble />
              )}

              <span>
                {markingAllAsRead
                  ? "Marking..."
                  : "Mark All as Read"}
              </span>
            </button>
          ) : null
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* NOTIFICATION SUMMARY */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
              <FaBell />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {loading ? (
                  "Loading Notifications..."
                ) : unreadCount > 0 ? (
                  `${unreadCount} Unread Notifications`
                ) : (
                  "You're All Caught Up"
                )}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {loading
                  ? "Please wait while we load your notifications."
                  : unreadCount > 0
                  ? "Review your latest updates so you don't miss important opportunities."
                  : "There are no unread notifications at the moment."}
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && !loading ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        ) : null}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-\[200px\] items-center justify-center rounded-2xl border border-emerald-100 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <FaSpinner className="animate-spin text-lg text-emerald-600" />
              <span>Loading notifications...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-\[200px\] items-center justify-center rounded-2xl border border-emerald-100 bg-white">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaBell />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                No notifications available.
              </p>
            </div>
          </div>
        ) : (
          /* NOTIFICATION LIST */
          <NotificationList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
