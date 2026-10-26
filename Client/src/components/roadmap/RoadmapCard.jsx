
import React from "react";
import { Link } from "react-router-dom";
import {
  FaRoute,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const RoadmapCard = ({
  id,
  title,
  description,
  duration,
  progress = 0,
  completedSteps = 0,
  totalSteps = 0,
}) => {
  const safeProgress = Math.min(
    Math.max(Number(progress) || 0, 0),
    100
  );

  const safeTotalSteps = Math.max(
    Number(totalSteps) || 0,
    0
  );

  const safeCompletedSteps = Math.min(
    Math.max(Number(completedSteps) || 0, 0),
    safeTotalSteps
  );

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="p-5">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 text-lg text-emerald-600">
            <FaRoute />
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {safeProgress}% Complete
          </span>
        </div>

        {/* TITLE */}
        <h3 className="mt-5 text-lg font-bold text-slate-900">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

        {/* INFO */}
        <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <FaClock className="shrink-0 text-emerald-600" />
            <span>{duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCheckCircle className="shrink-0 text-teal-600" />
            <span>
              {safeCompletedSteps}/{safeTotalSteps} Steps
            </span>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-5">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-emerald-50"
            role="progressbar"
            aria-label={`${title} completion`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safeProgress}
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        {/* BUTTON */}
        <Link
          to={`/roadmaps/${id}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          View Roadmap
          <FaArrowRight
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
};

export default RoadmapCard;
