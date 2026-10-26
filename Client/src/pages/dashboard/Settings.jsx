
import React, { useState } from "react";
import {
  FaBell,
  FaLock,
  FaUserCog,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";

const Settings = () => {
  const [settings, setSettings] = useState({
    jobAlerts: true,
    examAlerts: true,
    deadlineAlerts: true,
    studyReminders: true,
    resultAlerts: true,
    emailNotifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleToggle = (name) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: !currentSettings[name],
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const saveNotificationSettings = () => {
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(settings)
    );

    setMessage("Notification preferences saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("New password must contain at least 6 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage("Password updated successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const notificationOptions = [
    {
      key: "jobAlerts",
      title: "Government Job Alerts",
      description:
        "Receive notifications when new government jobs match your preferences.",
    },
    {
      key: "examAlerts",
      title: "Exam Updates",
      description:
        "Get updates about exam dates, schedules, and important announcements.",
    },
    {
      key: "deadlineAlerts",
      title: "Application Deadlines",
      description:
        "Receive reminders before important application deadlines.",
    },
    {
      key: "studyReminders",
      title: "Study Reminders",
      description:
        "Get reminders about your scheduled study tasks.",
    },
    {
      key: "resultAlerts",
      title: "Results & Admit Cards",
      description:
        "Stay informed about admit cards, results, and related updates.",
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description:
        "Receive important platform notifications through email.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title="Settings"
        subtitle="Manage your notifications, security, and account preferences."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* MESSAGE */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {message}
          </div>
        )}

        {/* NOTIFICATION SETTINGS */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b border-emerald-50 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Notification Preferences
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose which updates and reminders you want to receive.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:flex">
              <FaBell />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="divide-y divide-slate-100">
              {notificationOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start justify-between gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {option.title}
                    </h4>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      {option.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(option.key)}
                    aria-label={`Toggle ${option.title}`}
                    aria-pressed={settings[option.key]}
                    className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      settings[option.key]
                        ? "bg-emerald-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        settings[option.key]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={saveNotificationSettings}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
              >
                <FaSave />
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* PASSWORD SETTINGS */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b border-emerald-50 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Change Password
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Update your account password regularly to keep your account
                secure.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 sm:flex">
              <FaLock />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <form onSubmit={handlePasswordUpdate}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* CURRENT PASSWORD */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
                >
                  <FaLock />
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ACCOUNT SECURITY */}
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 shadow-sm">
          <div className="flex items-start gap-4 p-5 sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg text-emerald-700">
              <FaShieldAlt />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Account Security
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep your account information secure and avoid sharing your
                password with anyone.
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT PREFERENCES */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b border-emerald-50 px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Account Preferences
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your profile information helps personalize your preparation
                experience.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:flex">
              <FaUserCog />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-xl border border-emerald-100 bg-linear-to-r from-emerald-50/70 to-teal-50/70 p-4 sm:p-5">
              <strong className="text-sm font-bold text-slate-900">
                Personalized Recommendations
              </strong>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your selected qualification, preferred government jobs,
                preparation level, and study hours are used to provide
                relevant preparation recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
