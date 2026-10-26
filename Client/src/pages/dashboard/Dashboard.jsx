import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBriefcase,
  FaBookOpen,
  FaBell,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";

const API_URL = "http://localhost:5000";

const Dashboard = () => {
  const [jobCount, setJobCount] = useState(0);
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  const [jobError, setJobError] = useState("");
  const [userError, setUserError] = useState("");
  const [examError, setExamError] = useState("");
  const [notificationError, setNotificationError] =
    useState("");

  // =====================================================
  // FETCH AVAILABLE JOBS
  // =====================================================
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        setJobError("");

        const response = await fetch(`${API_URL}/api/jobs`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch jobs."
          );
        }

        setJobCount(data.count ?? data.jobs?.length ?? 0);
      } catch (error) {
        console.error("Fetch dashboard jobs error:", error);

        setJobError(
          error.message || "Unable to load jobs."
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // =====================================================
  // FETCH LOGGED-IN USER
  // =====================================================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        setUserError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setUserError("User is not authenticated.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch user profile."
          );
        }

        setUser(data.user);
      } catch (error) {
        console.error(
          "Fetch dashboard user error:",
          error
        );

        setUserError(
          error.message ||
            "Unable to load user information."
        );
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // =====================================================
  // FETCH UPCOMING EXAMS
  // =====================================================
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoadingExams(true);
        setExamError("");

        const response = await fetch(
          `${API_URL}/api/exams`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch exams."
          );
        }

        setExams(data.exams || []);
      } catch (error) {
        console.error(
          "Fetch dashboard exams error:",
          error
        );

        setExamError(
          error.message ||
            "Unable to load upcoming exams."
        );
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  // =====================================================
  // FETCH UNREAD NOTIFICATION COUNT
  // =====================================================
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        setLoadingNotifications(true);
        setNotificationError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/notifications/unread-count`,
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
              "Failed to fetch notification count."
          );
        }

        setNotificationCount(data.count ?? 0);
      } catch (error) {
        console.error(
          "Fetch dashboard notifications error:",
          error
        );

        setNotificationError(
          error.message ||
            "Unable to load notifications."
        );
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotificationCount();
  }, []);

  // =====================================================
  // CALCULATE DAYS LEFT FOR EXAM
  // =====================================================
  const getDaysLeft = (examDate) => {
    if (!examDate) {
      return "Date not specified";
    }

    const today = new Date();
    const exam = new Date(examDate);

    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);

    const difference =
      exam.getTime() - today.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return "Exam completed";
    }

    if (daysLeft === 0) {
      return "Today";
    }

    if (daysLeft === 1) {
      return "1 Day Left";
    }

    return `${daysLeft} Days Left`;
  };

  // =====================================================
  // DASHBOARD STATS
  // =====================================================
  const stats = [
    {
      title: "Available Jobs",
      value: loadingJobs ? (
        <FaSpinner className="animate-spin text-lg" />
      ) : jobError ? (
        "--"
      ) : (
        jobCount
      ),
      icon: <FaBriefcase />,
      link: "/jobs",
      iconStyle:
        "bg-emerald-50 text-emerald-600",
      hoverStyle:
        "hover:border-emerald-200 hover:bg-emerald-50/30",
      arrowStyle:
        "group-hover:text-emerald-600",
    },
    {
      title: "Upcoming Exams",
      value: loadingExams ? (
        <FaSpinner className="animate-spin text-lg" />
      ) : examError ? (
        "--"
      ) : (
        exams.length
      ),
      icon: <FaBookOpen />,
      link: "/exams",
      iconStyle:
        "bg-teal-50 text-teal-600",
      hoverStyle:
        "hover:border-teal-200 hover:bg-teal-50/30",
      arrowStyle:
        "group-hover:text-teal-600",
    },
    {
      title: "Notifications",
      value: loadingNotifications ? (
        <FaSpinner className="animate-spin text-lg" />
      ) : notificationError ? (
        "--"
      ) : (
        notificationCount
      ),
      icon: <FaBell />,
      link: "/notifications",
      iconStyle:
        "bg-amber-50 text-amber-600",
      hoverStyle:
        "hover:border-amber-200 hover:bg-amber-50/30",
      arrowStyle:
        "group-hover:text-amber-600",
    },
  ];

  // =====================================================
  // TODAY'S TASKS
  // TEMPORARY DATA
  // Will be connected to Study Plan backend later.
  // =====================================================
  const todayTasks = [
    {
      subject: "Quantitative Aptitude",
      topic: "Percentage",
      duration: "1 hour",
      completed: true,
    },
    {
      subject: "Reasoning",
      topic: "Number Series",
      duration: "45 minutes",
      completed: true,
    },
    {
      subject: "English",
      topic: "Reading Comprehension",
      duration: "45 minutes",
      completed: false,
    },
    {
      subject: "General Awareness",
      topic: "Current Affairs",
      duration: "30 minutes",
      completed: false,
    },
  ];

  // =====================================================
  // USER DISPLAY NAME
  // =====================================================
  const userName =
    user?.name ||
    localStorage.getItem("userName") ||
    "Candidate";

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <PageHeader
        title="Dashboard"
        subtitle={
          loadingUser
            ? "Welcome back! Continue your government job preparation."
            : userError
            ? "Welcome back! Continue your government job preparation."
            : `Welcome back, ${userName}! Continue your government job preparation.`
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">

        {/* =====================================================
            STATS
        ====================================================== */}
        <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {stats.map((stat) => (
            <Link
              to={stat.link}
              key={stat.title}
              className={`group rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stat.hoverStyle}`}
            >
              <div className="flex items-center justify-between">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg transition duration-300 group-hover:scale-105 ${stat.iconStyle}`}
                >
                  {stat.icon}
                </div>

                <FaArrowRight
                  className={`text-sm text-slate-300 transition-all duration-300 group-hover:translate-x-1 ${stat.arrowStyle}`}
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h3 className="mt-1 flex h-8 items-center text-2xl font-extrabold tracking-tight text-slate-900">
                  {stat.value}
                </h3>
              </div>
            </Link>
          ))}

        </div>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* ===================================================
              TODAY'S PREPARATION
          ==================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm xl:col-span-2">

            {/* CARD HEADER */}
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FaBookOpen className="text-sm" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Today's Preparation
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500 sm:pl-11">
                  Complete your scheduled study tasks.
                </p>
              </div>

              <Link
                to="/study-plan"
                className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition duration-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                View Plan
                <FaArrowRight className="text-xs" />
              </Link>

            </div>

            {/* CARD BODY */}
            <div className="p-5">

              {/* DAILY PROGRESS */}
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm font-semibold text-slate-700">
                    Daily Progress
                  </span>

                  <span className="text-sm font-extrabold text-emerald-600">
                    50%
                  </span>

                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">

                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: "50%" }}
                  />

                </div>

              </div>

              {/* TASK LIST */}
              <div className="divide-y divide-slate-100">

                {todayTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >

                    {/* TASK ICON */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        task.completed
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {task.completed ? (
                        <FaCheckCircle />
                      ) : (
                        <FaClock />
                      )}
                    </div>

                    {/* TASK CONTENT */}
                    <div className="min-w-0 flex-1">

                      <p
                        className={`text-sm font-semibold ${
                          task.completed
                            ? "text-slate-500"
                            : "text-slate-900"
                        }`}
                      >
                        {task.subject}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {task.topic}
                      </p>

                    </div>

                    {/* DURATION */}
                    <span className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                      {task.duration}
                    </span>

                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* ===================================================
              QUICK ACTIONS
          ==================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">

            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 py-5">

              <div className="flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <FaArrowRight className="text-sm" />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Quick Actions
                </h2>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Access important preparation tools.
              </p>

            </div>

            {/* ACTIONS */}
            <div className="space-y-1 p-4">

              {/* FIND JOBS */}
              <Link
                to="/jobs"
                className="group flex items-center gap-3 rounded-xl p-3 transition duration-200 hover:bg-emerald-50"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition duration-200 group-hover:bg-emerald-100">
                  <FaBriefcase />
                </div>

                <div className="min-w-0 flex-1">

                  <strong className="block text-sm font-semibold text-slate-800">
                    Find Government Jobs
                  </strong>

                  <span className="mt-1 block text-xs text-slate-500">
                    Explore latest opportunities
                  </span>

                </div>

                <FaArrowRight className="shrink-0 text-xs text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-emerald-600" />

              </Link>

              {/* EXAMS */}
              <Link
                to="/exams"
                className="group flex items-center gap-3 rounded-xl p-3 transition duration-200 hover:bg-teal-50"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition duration-200 group-hover:bg-teal-100">
                  <FaBookOpen />
                </div>

                <div className="min-w-0 flex-1">

                  <strong className="block text-sm font-semibold text-slate-800">
                    Explore Exams
                  </strong>

                  <span className="mt-1 block text-xs text-slate-500">
                    View syllabus and exam details
                  </span>

                </div>

                <FaArrowRight className="shrink-0 text-xs text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-teal-600" />

              </Link>

              {/* STUDY PLAN */}
              <Link
                to="/study-plan"
                className="group flex items-center gap-3 rounded-xl p-3 transition duration-200 hover:bg-amber-50"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition duration-200 group-hover:bg-amber-100">
                  <FaClock />
                </div>

                <div className="min-w-0 flex-1">

                  <strong className="block text-sm font-semibold text-slate-800">
                    Study Plan
                  </strong>

                  <span className="mt-1 block text-xs text-slate-500">
                    Continue today's preparation
                  </span>

                </div>

                <FaArrowRight className="shrink-0 text-xs text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-amber-600" />

              </Link>

            </div>
          </div>
        </div>

        {/* =====================================================
            UPCOMING EXAMS
        ====================================================== */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">

          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <FaBookOpen className="text-sm" />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Upcoming Exams
                </h2>

              </div>

              <p className="mt-2 text-sm text-slate-500 sm:pl-11">
                Keep an eye on important examination dates.
              </p>

            </div>

            <Link
              to="/exams"
              className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-teal-600 transition duration-200 hover:bg-teal-50 hover:text-teal-700"
            >
              View All
              <FaArrowRight className="text-xs" />
            </Link>

          </div>

          {/* EXAMS */}
          <div className="divide-y divide-slate-100">

            {loadingExams ? (
              <div className="flex items-center justify-center px-5 py-10">

                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">

                  <FaSpinner className="animate-spin text-emerald-600" />

                  Loading upcoming exams...

                </div>

              </div>
            ) : examError ? (
              <div className="px-5 py-10 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FaBell />
                </div>

                <p className="mt-3 text-sm font-medium text-red-500">
                  {examError}
                </p>

              </div>
            ) : exams.length === 0 ? (
              <div className="px-5 py-10 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <FaBookOpen />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-500">
                  No upcoming exams available.
                </p>

              </div>
            ) : (
              exams.map((exam, index) => (
                <div
                  key={exam._id}
                  className="flex flex-col gap-4 px-5 py-5 transition duration-200 hover:bg-emerald-50/30 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="min-w-0">

                    <strong className="block truncate text-sm font-bold text-slate-900">
                      {exam.name}
                    </strong>

                    <span className="mt-1 block text-xs text-slate-500">
                      {exam.organization}
                    </span>

                  </div>

                  <div
                    className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      index === 0
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : index === 1
                        ? "border border-teal-200 bg-teal-50 text-teal-700"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >

                    <FaClock />

                    <span>
                      {getDaysLeft(exam.examDate)}
                    </span>

                  </div>

                </div>
              ))
            )}

          </div>
        </div>

        {/* =====================================================
            MOTIVATION
        ====================================================== */}
        <div className="relative mt-6 overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-xl shadow-emerald-900/10">

          {/* BACKGROUND GLOWS */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl text-emerald-100">
              <FaCheckCircle />
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Your Government Job Journey Starts Here.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Discover opportunities, prepare with a personalized plan,
              track your progress, and keep improving every day.
            </p>

            <Link
              to="/study-plan"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
            >
              Continue Preparing
              <FaArrowRight className="text-xs" />
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;