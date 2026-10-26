import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaFileAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaBuilding,
  FaDatabase,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";

const API_URL = "http://localhost:5000";

const ExamDetails = () => {
  const { id } = useParams();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Exam ID is missing.");
        }

        const response = await fetch(
          `${API_URL}/api/exams/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch exam details."
          );
        }

        setExam(data.exam);
      } catch (error) {
        console.error("Fetch exam details error:", error);

        setError(
          error.message ||
            "Unable to load exam details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // ============================================================
  // DATE FORMATTER
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Exam Details"
          subtitle="Loading examination information..."
          breadcrumbs={[
            {
              label: "Government Exams",
              path: "/exams",
            },
            {
              label: "Loading...",
            },
          ]}
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading exam details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Exam Details"
          subtitle="Unable to load the requested examination."
          breadcrumbs={[
            {
              label: "Government Exams",
              path: "/exams",
            },
            {
              label: "Exam Details",
            },
          ]}
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white/90 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FaFileAlt />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Exam details could not be loaded
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "The requested examination could not be found."}
            </p>

            <Link
              to="/exams"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
            >
              <FaArrowLeft />
              Back to Exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title={exam.name}
        subtitle={`Complete information for ${exam.name}.`}
        breadcrumbs={[
          {
            label: "Government Exams",
            path: "/exams",
          },
          {
            label: exam.name,
          },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* BACK BUTTON */}
        <Link
          to="/exams"
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <FaArrowLeft />
          Back to Exams
        </Link>

        {/* ======================================================
            EXAM HEADER
        ======================================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-2xl text-white shadow-sm">
                <FaBookOpen />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {exam.category || "Government Examination"}
                  </span>

                  {exam.isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <FaCheckCircle className="text-[10px]" />
                      Active
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {exam.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  {exam.organization || "Government Organization"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            QUICK INFORMATION
        ======================================================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* APPLICATION START */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaCalendarAlt />
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Application Starts
                </span>

                <strong className="mt-1 block text-sm font-bold text-slate-900">
                  {formatDate(exam.applicationStartDate)}
                </strong>
              </div>
            </div>
          </div>

          {/* APPLICATION END */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FaFileAlt />
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Application Last Date
                </span>

                <strong className="mt-1 block text-sm font-bold text-slate-900">
                  {formatDate(exam.applicationEndDate)}
                </strong>
              </div>
            </div>
          </div>

          {/* EXAM DATE */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <FaCalendarAlt />
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Exam Date
                </span>

                <strong className="mt-1 block text-sm font-bold text-slate-900">
                  {exam.examDate
                    ? formatDate(exam.examDate)
                    : "Not announced"}
                </strong>
              </div>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <FaBuilding />
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Conducting Body
                </span>

                <strong className="mt-1 block text-sm font-bold text-slate-900">
                  {exam.organization || "Not specified"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            MAIN CONTENT
        ======================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* MAIN CONTENT */}
          <div className="space-y-6">
            {/* DESCRIPTION */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-900">
                  About This Examination
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information collected from the examination source.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm leading-7 text-slate-600">
                  {exam.description ||
                    "Detailed description is not available yet."}
                </p>
              </div>
            </div>

            {/* EXAMINATION SCHEDULE */}
            {exam.examSchedule && (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Examination Schedule
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Available examination schedule information.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <FaCalendarAlt />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Scheduled Examination
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {exam.examSchedule}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SOURCE INFORMATION */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Source Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Reference information for this examination.
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Source
                  </span>

                  <strong className="mt-1 block text-sm font-bold text-slate-900">
                    {exam.source || "Not specified"}
                  </strong>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Source ID
                  </span>

                  <strong className="mt-1 block break-all text-sm font-bold text-slate-900">
                    {exam.sourceId || "Not specified"}
                  </strong>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <FaDatabase className="text-emerald-600" />

                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Notification Date
                    </span>
                  </div>

                  <strong className="mt-1 block text-sm font-bold text-slate-900">
                    {formatDate(exam.notificationDate)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* OFFICIAL LINKS */}
            <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg text-white shadow-sm">
                  <FaFileAlt />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Official Information
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use the official source to read the notification and apply
                  for this examination.
                </p>

                <div className="mt-5 space-y-3">
                  {exam.notificationUrl && (
                    <a
                      href={exam.notificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <FaFileAlt />
                      View Notification
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}

                  {exam.applyUrl && (
                    <a
                      href={exam.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      Apply Officially
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}

                  {!exam.notificationUrl && !exam.applyUrl && (
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-500">
                      Official links are not available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STUDY PLAN CTA */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-lg text-teal-600">
                  <FaBookOpen />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Start Your Preparation
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create a personalized study plan based on this examination.
                </p>

                <Link
                  to="/study-plan"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Create Study Plan
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;