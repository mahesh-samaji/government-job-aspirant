
import React from "react";
import {
  FaCheckCircle,
  FaCircle,
  FaLock,
  FaBookOpen,
} from "react-icons/fa";

const RoadmapStep = ({
  stepNumber,
  title,
  description,
  status = "pending",
  onComplete,
  saving = false,
}) => {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  return (
    <div
      className={`relative flex gap-4 rounded-2xl border p-5 transition duration-300 ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/50"
          : isCurrent
          ? "border-teal-200 bg-teal-50/50 shadow-sm"
          : isLocked
          ? "border-slate-200 bg-slate-50 opacity-70"
          : "border-emerald-100 bg-white"
      }`}
    >
      {/* STEP NUMBER / STATUS ICON */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isCompleted
            ? "bg-emerald-100 text-emerald-600"
            : isCurrent
            ? "bg-linear-to-br from-emerald-600 to-teal-600 text-white"
            : isLocked
            ? "bg-slate-200 text-slate-500"
            : "bg-emerald-50 text-emerald-700"
        }`}
        aria-label={`Step ${stepNumber}: ${
          isCompleted
            ? "Completed"
            : isCurrent
            ? "In progress"
            : isLocked
            ? "Locked"
            : "Upcoming"
        }`}
      >
        {isCompleted ? (
          <FaCheckCircle
            className="text-lg"
            aria-hidden="true"
          />
        ) : isLocked ? (
          <FaLock
            className="text-sm"
            aria-hidden="true"
          />
        ) : (
          <span>{stepNumber}</span>
        )}
      </div>

      {/* CONTENT */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <FaBookOpen
            aria-hidden="true"
            className={`shrink-0 text-sm ${
              isCompleted
                ? "text-emerald-600"
                : isCurrent
                ? "text-teal-600"
                : "text-slate-500"
            }`}
          />

          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
            {title}
          </h3>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

        {/* STATUS */}
        <span
          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : isCurrent
              ? "bg-teal-100 text-teal-700"
              : isLocked
              ? "bg-slate-200 text-slate-600"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isCompleted
            ? "Completed"
            : isCurrent
            ? "In Progress"
            : isLocked
            ? "Locked"
            : "Upcoming"}
        </span>

        {/* COMPLETE BUTTON */}
        {isCurrent && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onComplete?.(stepNumber)}
              disabled={saving}
              aria-label={`Mark step ${stepNumber} as complete`}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaCheckCircle aria-hidden="true" />
              {saving ? "Saving..." : "Mark as Complete"}
            </button>
          </div>
        )}
      </div>

      {/* CURRENT / PENDING INDICATOR */}
      {!isCompleted && !isLocked && (
        <FaCircle
          aria-hidden="true"
          className={`absolute right-5 top-6 text-xs ${
            isCurrent
              ? "text-emerald-600"
              : "text-slate-300"
          }`}
        />
      )}
    </div>
  );
};

export default RoadmapStep;
