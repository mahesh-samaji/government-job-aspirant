
import React, { useState } from "react";
import {
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

const StudyPlanCard = ({
  id,
  subject,
  topic,
  duration,
  status = "Pending",
  progress = 0,
  onProgressChange,
  saving = false,
}) => {
  const isCompleted = status.toLowerCase() === "completed";

  const safeProgress = Math.min(
    Math.max(Number(progress) || 0, 0),
    100
  );

  const [selectedProgress, setSelectedProgress] =
    useState(safeProgress);

  // Keep local selector synchronized with backend data.
  React.useEffect(() => {
    setSelectedProgress(safeProgress);
  }, [safeProgress]);

  const handleSave = () => {
    if (typeof onProgressChange === "function") {
      onProgressChange(id, selectedProgress);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="p-5">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
            <FaBookOpen />
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : safeProgress > 0
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {status}
          </span>
        </div>

        {/* SUBJECT */}
        <h3 className="mt-5 text-lg font-bold text-slate-900">
          {subject}
        </h3>

        {/* TOPIC */}
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {topic}
        </p>

        {/* DURATION */}
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <FaClock className="text-blue-600" />
          <span>{duration}</span>
        </div>

        {/* PROGRESS */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Progress
            </span>

            <strong className="font-bold text-slate-900">
              {safeProgress}%
            </strong>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        {/* UPDATE PROGRESS */}
        <div className="mt-5">
          <label
            htmlFor={`progress-${id}`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Update your progress
          </label>

          <select
            id={`progress-${id}`}
            value={selectedProgress}
            onChange={(e) =>
              setSelectedProgress(Number(e.target.value))
            }
            disabled={saving}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value={0}>Not Started — 0%</option>
            <option value={25}>Started — 25%</option>
            <option value={50}>Halfway — 50%</option>
            <option value={75}>Almost Done — 75%</option>
            <option value={100}>Completed — 100%</option>
          </select>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedProgress === safeProgress}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Progress
              </>
            )}
          </button>
        </div>

        {/* COMPLETED */}
        {isCompleted && (
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            <FaCheckCircle />
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanCard;