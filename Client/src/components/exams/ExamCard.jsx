import React from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const ExamCard = ({
  id,
  name,
  conductingBody,
  examDate,
  applicationLastDate,
  category,
}) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
      <div className="flex h-full flex-col p-5">
        {/* CATEGORY */}
        <div className="flex items-center justify-between">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {category || "Government Exam"}
          </span>
        </div>

        {/* EXAM NAME */}
        <h3 className="mt-4 min-h-14 text-lg font-bold leading-7 text-slate-900">
          {name}
        </h3>

        {/* CONDUCTING BODY */}
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <FaBookOpen className="shrink-0 text-emerald-600" />
          <span>{conductingBody}</span>
        </div>

        {/* EXAM INFO */}
        <div className="mt-5 space-y-4 rounded-xl border border-emerald-100/70 bg-linear-to-br from-emerald-50/70 via-white to-teal-50/70 p-4">
          <div className="flex items-start gap-3">
            <FaCalendarAlt className="mt-1 shrink-0 text-emerald-600" />

            <div className="min-w-0">
              <span className="block text-xs font-medium text-slate-400">
                Exam Date
              </span>

              <strong className="mt-1 block text-sm font-semibold text-slate-800">
                {examDate}
              </strong>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaClock className="mt-1 shrink-0 text-teal-600" />

            <div className="min-w-0">
              <span className="block text-xs font-medium text-slate-400">
                Application Last Date
              </span>

              <strong className="mt-1 block text-sm font-semibold text-slate-800">
                {applicationLastDate}
              </strong>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <Link
          to={`/exams/${id}`}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <span>View Exam Details</span>
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </div>
  );
};

export default ExamCard;