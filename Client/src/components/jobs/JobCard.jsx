import React from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaGraduationCap,
} from "react-icons/fa";

const JobCard = ({
  id,
  title,
  organization,
  location,
  lastDate,
  qualification,
  jobType = "Government Job",
}) => {
  return (
    <article className="flex h-full min-h-\[500px\] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
      <div className="flex h-full flex-col p-5">
        {/* JOB TYPE + ICON */}
        <div className="flex min-h-9 items-center justify-between">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {jobType}
          </span>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FaBuilding className="text-sm" />
          </div>
        </div>

        {/* JOB TITLE */}
        <div className="mt-4 h-14">
          <h3 className="line-clamp-2 text-lg font-bold leading-7 text-slate-900">
            {title}
          </h3>
        </div>

        {/* ORGANIZATION */}
        <div className="mt-3 flex h-5 items-center gap-2 text-sm text-slate-500">
          <FaBuilding className="shrink-0 text-emerald-600" />

          <span className="truncate">
            {organization || "Not specified"}
          </span>
        </div>

        {/* JOB INFORMATION */}
        <div className="mt-5 min-h-\[136px\] space-y-4 rounded-xl border border-emerald-100/70 bg-linear-to-br from-emerald-50/70 via-white to-teal-50/70 p-4">
          {/* LOCATION */}
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="mt-1 shrink-0 text-teal-600" />

            <div className="min-w-0">
              <span className="block text-xs font-medium text-slate-400">
                Location
              </span>

              <strong className="mt-1 block truncate text-sm font-semibold text-slate-800">
                {location || "Not specified"}
              </strong>
            </div>
          </div>

          {/* APPLICATION LAST DATE */}
          <div className="flex items-start gap-3">
            <FaCalendarAlt className="mt-1 shrink-0 text-amber-600" />

            <div className="min-w-0">
              <span className="block text-xs font-medium text-slate-400">
                Application Last Date
              </span>

              <strong className="mt-1 block truncate text-sm font-semibold text-slate-800">
                {lastDate || "Not specified"}
              </strong>
            </div>
          </div>
        </div>

        {/* QUALIFICATION */}
        <div className="mt-5 flex min-h-\[64px\] items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FaGraduationCap />
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium text-slate-400">
              Qualification
            </span>

            <strong className="mt-1 block line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
              {qualification || "Not specified"}
            </strong>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-auto pt-5">
          <Link
            to={`/jobs/${id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <span>View Job Details</span>

            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default JobCard;