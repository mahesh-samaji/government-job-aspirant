
import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";
import StudyPlanCard from "../../components/studyPlan/StudyPlanCard";

const API_URL = "http://localhost:5000";

// =====================================================
// DATE HELPERS
// =====================================================

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateFromInput = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const getDateLabel = (date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isSameCalendarDate = (taskDate, selectedDate) => {
  if (!taskDate || !selectedDate) return false;

  const task = new Date(taskDate);

  if (Number.isNaN(task.getTime())) return false;

  return (
    task.getFullYear() === selectedDate.getFullYear() &&
    task.getMonth() === selectedDate.getMonth() &&
    task.getDate() === selectedDate.getDate()
  );
};

const formatDuration = (minutes) => {
  const value = Number(minutes) || 0;

  if (value < 60) {
    return `${value} minutes`;
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minutes`;
};

// =====================================================
// STUDY PLAN PAGE
// =====================================================

const StudyPlan = () => {
  const [selectedDate, setSelectedDate] = useState("Today");
  const [customDate, setCustomDate] = useState("");

  const [studyPlans, setStudyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [savingTaskId, setSavingTaskId] = useState(null);
  const [progressError, setProgressError] = useState("");
  const [progressSuccess, setProgressSuccess] = useState("");

  const [formData, setFormData] = useState({
    examId: "",
    preparationLevel: "Beginner",
    dailyStudyHours: "",
  });

  // =====================================================
  // FETCH STUDY PLANS
  // =====================================================

  const fetchStudyPlans = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to access your study plan.");
        return;
      }

      const response = await fetch(`${API_URL}/api/study-plans`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load your study plans.");
        return;
      }

      const plans = Array.isArray(data.studyPlans)
        ? data.studyPlans
        : [];

      setStudyPlans(plans);
      setSelectedPlan(plans[0] || null);
    } catch (error) {
      console.error("Fetch study plans error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  };

  // =====================================================
  // FETCH AVAILABLE EXAMS DYNAMICALLY
  // =====================================================

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/exams`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch exams.");
      }

      const availableExams = Array.isArray(data.exams)
        ? data.exams
        : [];

      setExams(availableExams);
    } catch (error) {
      console.error("Fetch exams error:", error);

      setCreateError(
        "Unable to load available exams. Please try again."
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadStudyPlanData = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          fetchStudyPlans(),
          fetchExams(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadStudyPlanData();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setCreateError("");
    setCreateSuccess("");
  };

  // =====================================================
  // OPEN CREATE FORM
  // =====================================================

  const openCreateForm = () => {
    setCreateError("");
    setCreateSuccess("");

    if (exams.length > 0) {
      setFormData((previous) => ({
        ...previous,
        examId: previous.examId || exams[0]._id,
      }));
    }

    setShowCreateForm(true);
  };

  // =====================================================
  // CLOSE CREATE FORM
  // =====================================================

  const closeCreateForm = () => {
    if (creatingPlan) return;

    setShowCreateForm(false);
    setCreateError("");
    setCreateSuccess("");
  };

  // =====================================================
  // CREATE STUDY PLAN
  // =====================================================

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    if (!formData.examId) {
      setCreateError("Please select an exam.");
      return;
    }

    if (!formData.dailyStudyHours) {
      setCreateError("Please enter your daily study hours.");
      return;
    }

    const dailyStudyHours = Number(formData.dailyStudyHours);

    if (
      !Number.isFinite(dailyStudyHours) ||
      dailyStudyHours < 1 ||
      dailyStudyHours > 24
    ) {
      setCreateError(
        "Daily study hours must be between 1 and 24."
      );
      return;
    }

    try {
      setCreatingPlan(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setCreateError(
          "Your login session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(`${API_URL}/api/study-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId: formData.examId,
          preparationLevel: formData.preparationLevel,
          dailyStudyHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(
          data.message || "Unable to create study plan."
        );
        return;
      }

      setCreateSuccess(
        data.message || "Study plan saved successfully."
      );

      if (data.studyPlan) {
        setSelectedPlan(data.studyPlan);

        setStudyPlans((previousPlans) => {
          const existingIndex = previousPlans.findIndex(
            (plan) => plan._id === data.studyPlan._id
          );

          if (existingIndex !== -1) {
            const updatedPlans = [...previousPlans];
            updatedPlans[existingIndex] = data.studyPlan;
            return updatedPlans;
          }

          return [data.studyPlan, ...previousPlans];
        });
      }

      setSelectedDate("Today");
      setCustomDate("");

      setTimeout(() => {
        setShowCreateForm(false);
        setCreateSuccess("");
      }, 700);
    } catch (error) {
      console.error("Create study plan error:", error);

      setCreateError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setCreatingPlan(false);
    }
  };

  // =====================================================
  // SAVE TASK PROGRESS
  // =====================================================

  const handleProgressChange = async (taskId, progress) => {
    if (!selectedPlan?._id || !taskId) {
      setProgressError("Study plan or task ID is missing.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setProgressError(
        "Your login session has expired. Please login again."
      );
      return;
    }

    try {
      setSavingTaskId(taskId);
      setProgressError("");
      setProgressSuccess("");

      const response = await fetch(
        `${API_URL}/api/study-plans/${selectedPlan._id}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress: Number(progress),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save task progress."
        );
      }

      if (data.studyPlan) {
        setSelectedPlan(data.studyPlan);

        setStudyPlans((previousPlans) =>
          previousPlans.map((plan) =>
            plan._id === data.studyPlan._id
              ? data.studyPlan
              : plan
          )
        );
      }

      setProgressSuccess("Progress saved successfully.");
    } catch (error) {
      console.error("Save progress error:", error);

      setProgressError(
        error.message || "Unable to save progress."
      );
    } finally {
      setSavingTaskId(null);
    }
  };

  // =====================================================
  // SELECTED CALENDAR DATE
  // =====================================================

  const selectedCalendarDate = useMemo(() => {
    if (selectedDate === "Custom" && customDate) {
      return getDateFromInput(customDate);
    }

    const date = new Date();

    if (selectedDate === "Yesterday") {
      date.setDate(date.getDate() - 1);
    } else if (selectedDate === "Tomorrow") {
      date.setDate(date.getDate() + 1);
    }

    date.setHours(0, 0, 0, 0);

    return date;
  }, [selectedDate, customDate]);

  const selectedDateKey = selectedCalendarDate
    ? toDateInputValue(selectedCalendarDate)
    : "";

  const selectedDateLabel =
    selectedDate === "Today"
      ? "Today"
      : selectedDate === "Yesterday"
        ? "Yesterday"
        : selectedDate === "Tomorrow"
          ? "Tomorrow"
          : selectedCalendarDate
            ? getDateLabel(selectedCalendarDate)
            : "Selected Date";

  // =====================================================
  // DATE SELECTION HANDLERS
  // =====================================================

  const handleQuickDateChange = (date) => {
    setSelectedDate(date);
    setCustomDate("");
    setProgressError("");
    setProgressSuccess("");
  };

  const handleCalendarChange = (e) => {
    const value = e.target.value;

    if (!value) return;

    setCustomDate(value);
    setSelectedDate("Custom");
    setProgressError("");
    setProgressSuccess("");
  };

  // =====================================================
  // TASKS FOR SELECTED DATE
  // =====================================================

  const studyTasks = useMemo(() => {
    if (
      !selectedPlan ||
      !Array.isArray(selectedPlan.tasks) ||
      !selectedCalendarDate
    ) {
      return [];
    }

    return selectedPlan.tasks
      .filter((task) =>
        isSameCalendarDate(
          task.scheduledDate,
          selectedCalendarDate
        )
      )
      .map((task) => ({
        id: task._id,
        subject: task.subject,
        topic: task.topic,
        description: task.description || "",
        duration: formatDuration(task.durationMinutes),
        durationMinutes: task.durationMinutes,
        status: task.status || "Pending",
        progress: Number(task.progress || 0),
        scheduledDate: task.scheduledDate,
      }));
  }, [selectedPlan, selectedCalendarDate]);

  // =====================================================
  // ALL TASKS
  // =====================================================

  const allPlanTasks = useMemo(() => {
    return Array.isArray(selectedPlan?.tasks)
      ? selectedPlan.tasks
      : [];
  }, [selectedPlan]);

  // =====================================================
  // COMPLETED TASKS FOR SELECTED DATE
  // =====================================================

  const completedTasks = useMemo(() => {
    return studyTasks.filter(
      (task) =>
        task.status === "Completed" ||
        Number(task.progress) === 100
    ).length;
  }, [studyTasks]);

  // =====================================================
  // OVERALL PLAN PROGRESS
  // =====================================================

  const overallProgress = useMemo(() => {
    if (allPlanTasks.length === 0) return 0;

    const totalProgress = allPlanTasks.reduce(
      (total, task) =>
        total + Number(task.progress || 0),
      0
    );

    return Math.round(totalProgress / allPlanTasks.length);
  }, [allPlanTasks]);

  // =====================================================
  // SELECTED DATE PROGRESS
  // =====================================================

  const selectedDayProgress = useMemo(() => {
    if (studyTasks.length === 0) return 0;

    const totalProgress = studyTasks.reduce(
      (total, task) =>
        total + Number(task.progress || 0),
      0
    );

    return Math.round(totalProgress / studyTasks.length);
  }, [studyTasks]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Study Plan"
          subtitle="Follow your personalized preparation schedule and stay consistent."
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Loading your study plan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Study Plan"
          subtitle="Follow your personalized preparation schedule and stay consistent."
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-700">
              Unable to load Study Plan
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO STUDY PLAN
  // =====================================================

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Study Plan"
          subtitle="Follow your personalized preparation schedule and stay consistent."
          actions={
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <FaPlus />
              <span>Create Plan</span>
            </button>
          }
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">
              <FaCalendarAlt />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No Study Plan Yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Create a personalized study plan by selecting an exam,
              preparation level, and your available daily study hours.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
            >
              <FaPlus />
              Create Your Study Plan
            </button>
          </div>
        </div>

        {showCreateForm && (
          <CreatePlanModal
            exams={exams}
            formData={formData}
            creatingPlan={creatingPlan}
            createError={createError}
            createSuccess={createSuccess}
            onChange={handleFormChange}
            onSubmit={handleCreatePlan}
            onClose={closeCreateForm}
          />
        )}
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title="Study Plan"
        subtitle="Follow your personalized preparation schedule and stay consistent."
        actions={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <FaPlus />
            <span>Create Plan</span>
          </button>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* DATE SELECTOR */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedDateLabel}'s Plan
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select a day or choose any date from the calendar.
                </p>

                {selectedCalendarDate && (
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {getDateLabel(selectedCalendarDate)}
                  </p>
                )}
              </div>

              {/* WORKING CALENDAR PICKER */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                <FaCalendarAlt className="shrink-0 text-emerald-600" />

                <label
                  htmlFor="studyPlanCalendar"
                  className="text-sm font-semibold text-slate-700"
                >
                  Choose Date
                </label>

                <input
                  id="studyPlanCalendar"
                  type="date"
                  value={selectedDateKey}
                  onChange={handleCalendarChange}
                  aria-label="Choose study plan date"
                  className="min-w-0 cursor-pointer border-0 bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            {/* QUICK DATE BUTTONS */}
            <div className="mt-5 flex flex-wrap gap-2">
              {["Yesterday", "Today", "Tomorrow"].map((date) => (
                <button
                  type="button"
                  key={date}
                  onClick={() => handleQuickDateChange(date)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    selectedDate === date
                      ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                      : "border border-emerald-100 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                <FaClock />
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-500">
                  Study Time
                </span>

                <strong className="mt-1 block text-lg font-bold text-slate-900">
                  {selectedPlan.dailyStudyHours} Hours
                </strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg text-teal-600">
                <FaCheckCircle />
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-500">
                  Completed
                </span>

                <strong className="mt-1 block text-lg font-bold text-slate-900">
                  {completedTasks} Tasks
                </strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-lg text-cyan-700">
                <FaCalendarAlt />
              </div>

              <div className="min-w-0">
                <span className="block text-sm font-medium text-slate-500">
                  Exam Preparation
                </span>

                <strong className="mt-1 block truncate text-lg font-bold text-slate-900">
                  {selectedPlan.exam?.name || "Selected Exam"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* PLAN INFORMATION */}
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedPlan.exam?.name || "Study Plan"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPlan.exam?.organization || "Government Exam"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  {selectedPlan.preparationLevel}
                </span>

                <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  {selectedPlan.dailyStudyHours} hrs/day
                </span>

                <span className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                  {overallProgress}% overall
                </span>

                <span className="rounded-lg bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">
                  {selectedDayProgress}% selected day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TASKS */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedDateLabel}'s Tasks
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Complete each task to maintain your preparation streak.
            </p>
          </div>

          {progressError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {progressError}
            </div>
          )}

          {progressSuccess && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700"
            >
              {progressSuccess}
            </div>
          )}

          {studyTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {studyTasks.map((task) => (
                <StudyPlanCard
                  key={task.id}
                  id={task.id}
                  subject={task.subject}
                  topic={task.topic}
                  description={task.description}
                  duration={task.duration}
                  durationMinutes={task.durationMinutes}
                  status={task.status}
                  progress={task.progress}
                  scheduledDate={task.scheduledDate}
                  onProgressChange={handleProgressChange}
                  saving={savingTaskId === task.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaCalendarAlt />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No tasks scheduled
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                There are no study tasks scheduled for this date.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {selectedCalendarDate
                  ? getDateLabel(selectedCalendarDate)
                  : selectedDateKey}
              </p>
            </div>
          )}
        </section>

        {/* TIP */}
        <div className="mt-8 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 shadow-sm">
          <div className="p-5 sm:p-6">
            <h3 className="text-lg font-bold text-slate-900">
              Preparation Tip
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Focus on completing your scheduled tasks consistently.
              If a subject is taking more time than expected, adjust
              tomorrow's plan instead of skipping the topic.
            </p>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <CreatePlanModal
          exams={exams}
          formData={formData}
          creatingPlan={creatingPlan}
          createError={createError}
          createSuccess={createSuccess}
          onChange={handleFormChange}
          onSubmit={handleCreatePlan}
          onClose={closeCreateForm}
        />
      )}
    </div>
  );
};

// =====================================================
// CREATE PLAN MODAL
// =====================================================

const CreatePlanModal = ({
  exams,
  formData,
  creatingPlan,
  createError,
  createSuccess,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Create Study Plan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Set your preparation preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creatingPlan}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-slate-600 disabled:cursor-not-allowed"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-5 px-5 py-6">

            {createError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {createError}
              </div>
            )}

            {createSuccess && (
              <div
                role="status"
                className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700"
              >
                {createSuccess}
              </div>
            )}

            <div>
              <label
                htmlFor="examId"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Exam
              </label>

              <select
                id="examId"
                name="examId"
                value={formData.examId}
                onChange={onChange}
                disabled={creatingPlan || exams.length === 0}
                required
                className="h-12 w-full rounded-lg border border-emerald-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-emerald-50"
              >
                <option value="">
                  {exams.length === 0
                    ? "No exams available"
                    : "Select an exam"}
                </option>

                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name}
                  </option>
                ))}
              </select>

              {exams.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No exams are currently available from the database.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="preparationLevel"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Preparation Level
              </label>

              <select
                id="preparationLevel"
                name="preparationLevel"
                value={formData.preparationLevel}
                onChange={onChange}
                disabled={creatingPlan}
                className="h-12 w-full rounded-lg border border-emerald-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-emerald-50"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dailyStudyHours"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Daily Study Hours
              </label>

              <input
                id="dailyStudyHours"
                type="number"
                name="dailyStudyHours"
                min="1"
                max="24"
                step="0.5"
                placeholder="Example: 4"
                value={formData.dailyStudyHours}
                onChange={onChange}
                disabled={creatingPlan}
                required
                className="h-12 w-full rounded-lg border border-emerald-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-emerald-50"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter the number of hours you can realistically study each day.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={creatingPlan}
              className="rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingPlan || exams.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:from-emerald-300 disabled:to-teal-400"
            >
              {creatingPlan ? (
                "Creating..."
              ) : (
                <>
                  <FaPlus />
                  Create Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyPlan;
