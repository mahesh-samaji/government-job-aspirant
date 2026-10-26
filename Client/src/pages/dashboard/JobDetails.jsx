import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaFileAlt,
  FaExternalLinkAlt,
  FaMoneyBillWave,
  FaUserClock,
  FaSpinner,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";

const API_URL = "http://localhost:5000";

const JobDetails = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/jobs/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch job details."
          );
        }

        setJob(data.job);
      } catch (error) {
        console.error("Fetch job details error:", error);

        setError(
          error.message ||
            "Unable to load job details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

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
      month: "long",
      year: "numeric",
    });
  };

  const formatQualification = (qualification) => {
    if (!qualification) {
      return "Not specified";
    }

    if (Array.isArray(qualification)) {
      if (qualification.length === 0) {
        return "Not specified";
      }

      return qualification.join(", ");
    }

    return qualification;
  };

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader
          title="Job Details"
          subtitle="Loading job information..."
          breadcrumbs={[
            {
              label: "Government Jobs",
              path: "/jobs",
            },
            {
              label: "Job Details",
            },
          ]}
        />

        <div className="mx-auto flex min-h-\[400px\] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading job details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader
          title="Job Details"
          subtitle="Unable to load this job."
          breadcrumbs={[
            {
              label: "Government Jobs",
              path: "/jobs",
            },
            {
              label: "Job Details",
            },
          ]}
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FaFileAlt />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Job not found
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {error ||
                "The requested government job could not be found."}
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaArrowLeft />
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Job Values
  |--------------------------------------------------------------------------
  */

  const qualification = formatQualification(
    job.qualification
  );

  const category =
    job.category || "Government Job";

  const lastDate = formatDate(
    job.applicationEndDate
  );

  const applicationStartDate = formatDate(
    job.applicationStartDate
  );

  const notificationDate = formatDate(
    job.notificationDate
  );

  const examDate = formatDate(job.examDate);

  const hasNotificationUrl =
    Boolean(job.notificationUrl);

  const hasApplyUrl = Boolean(job.applyUrl);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={job.title}
        subtitle={`Complete information about ${job.title}.`}
        breadcrumbs={[
          {
            label: "Government Jobs",
            path: "/jobs",
          },
          {
            label: job.title,
          },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* BACK BUTTON */}
        <Link
          to="/jobs"
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <FaArrowLeft />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* =========================================================
              MAIN CONTENT
          ========================================================== */}

          <div className="space-y-6">
            {/* JOB HEADER + BASIC INFORMATION */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                    <FaBuilding />
                  </div>

                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {category}
                    </span>

                    <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                      {job.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 sm:text-base">
                      {job.organization}
                    </p>
                  </div>
                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* LOCATION */}

                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FaMapMarkerAlt />
                    </div>

                    <div>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Location
                      </span>

                      <strong className="mt-1 block text-sm font-bold text-slate-900">
                        {job.location || "Not specified"}
                      </strong>
                    </div>
                  </div>

                  {/* QUALIFICATION */}

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <FaGraduationCap />
                    </div>

                    <div className="min-w-0">
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Qualification
                      </span>

                      <strong className="mt-1 block text-sm font-bold leading-6 text-slate-900">
                        {qualification}
                      </strong>
                    </div>
                  </div>

                  {/* LAST DATE */}

                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <FaCalendarAlt />
                    </div>

                    <div>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Last Date
                      </span>

                      <strong className="mt-1 block text-sm font-bold text-slate-900">
                        {lastDate}
                      </strong>
                    </div>
                  </div>

                  {/* VACANCIES */}

                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <FaFileAlt />
                    </div>

                    <div>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Vacancies
                      </span>

                      <strong className="mt-1 block text-sm font-bold text-slate-900">
                        {job.vacancies ?? "Not specified"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================
                JOB OVERVIEW
            ========================================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Job Overview
                </h2>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <p className="text-sm leading-7 text-slate-600">
                  {job.description ||
                    `This is an official ${job.category || "government"} recruitment opportunity from ${job.organization || "the recruiting organization"}.`}
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                      Organization
                    </span>

                    <strong className="mt-1 block text-sm font-bold text-slate-900">
                      {job.organization || "Not specified"}
                    </strong>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                      Category
                    </span>

                    <strong className="mt-1 block text-sm font-bold text-slate-900">
                      {job.category || "Government Job"}
                    </strong>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                      Notification Date
                    </span>

                    <strong className="mt-1 block text-sm font-bold text-slate-900">
                      {notificationDate}
                    </strong>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                      Application Start
                    </span>

                    <strong className="mt-1 block text-sm font-bold text-slate-900">
                      {applicationStartDate}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================
                ELIGIBILITY
            ========================================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Eligibility
                </h2>
              </div>

              <div className="p-5 sm:p-6">
                <ul className="space-y-4">
                  {/* EDUCATIONAL QUALIFICATION */}

                  <li className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                    <span>
                      <strong className="font-bold text-slate-900">
                        Educational Qualification:
                      </strong>{" "}
                      {qualification}
                    </span>
                  </li>

                  {/* AGE */}

                  {job.ageLimit ? (
                    <li className="flex gap-3 text-sm leading-6 text-slate-600">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                      <span>
                        <strong className="font-bold text-slate-900">
                          Age Limit:
                        </strong>{" "}
                        {job.ageLimit}
                      </span>
                    </li>
                  ) : null}

                  {/* LOCATION */}

                  <li className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                    <span>
                      <strong className="font-bold text-slate-900">
                        Job Location:
                      </strong>{" "}
                      {job.location || "Not specified"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* =========================================================
                IMPORTANT DATES
            ========================================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Important Dates
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-xl bg-blue-50 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Notification Date
                  </span>

                  <strong className="mt-2 block text-sm font-bold text-slate-900">
                    {notificationDate}
                  </strong>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-green-600">
                    Application Start
                  </span>

                  <strong className="mt-2 block text-sm font-bold text-slate-900">
                    {applicationStartDate}
                  </strong>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Last Date
                  </span>

                  <strong className="mt-2 block text-sm font-bold text-slate-900">
                    {lastDate}
                  </strong>
                </div>
              </div>
            </div>

            {/* =========================================================
                SELECTION / EXAM INFORMATION
            ========================================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Exam / Interview Information
                </h2>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                      Exam / Interview Date
                    </span>

                    <strong className="mt-1 block text-sm font-bold text-slate-900">
                      {examDate}
                    </strong>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-500">
                  Please refer to the official notification for the complete
                  selection process, examination pattern, interview
                  requirements, document requirements, and other applicable
                  instructions.
                </p>
              </div>
            </div>

            {/* =========================================================
                OFFICIAL NOTIFICATION
            ========================================================== */}

            {hasNotificationUrl && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Official Notification
                  </h2>
                </div>

                <div className="p-5 sm:p-6">
                  <p className="text-sm leading-6 text-slate-500">
                    Read the official recruitment notification for complete
                    eligibility conditions, vacancies, dates, selection
                    process, application instructions, and other details.
                  </p>

                  <a
                    href={job.notificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    View Official Notification
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================
              SIDEBAR
          ========================================================== */}

          <aside className="space-y-6">
            {/* APPLICATION DETAILS */}

            <div className="rounded-2xl border border-blue-100 bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Application Details
                </h3>

                <div className="mt-5 space-y-4">
                  {/* APPLICATION START */}

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-sm text-slate-500">
                      Start Date
                    </span>

                    <strong className="text-right text-sm font-bold text-slate-900">
                      {applicationStartDate}
                    </strong>
                  </div>

                  {/* LAST DATE */}

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-sm text-slate-500">
                      Last Date
                    </span>

                    <strong className="text-right text-sm font-bold text-slate-900">
                      {lastDate}
                    </strong>
                  </div>

                  {/* EXAM DATE */}

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-sm text-slate-500">
                      Exam / Interview
                    </span>

                    <strong className="text-right text-sm font-bold text-slate-900">
                      {examDate}
                    </strong>
                  </div>

                  {/* VACANCIES */}

                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-sm text-slate-500">
                      Vacancies
                    </span>

                    <strong className="text-right text-sm font-bold text-slate-900">
                      {job.vacancies ?? "Not specified"}
                    </strong>
                  </div>

                  {/* SALARY */}

                  <div className="flex items-start justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <FaMoneyBillWave className="text-green-600" />
                      Salary
                    </span>

                    <strong className="text-right text-sm font-bold text-slate-900">
                      {job.salary || "Not specified"}
                    </strong>
                  </div>
                </div>

                {/* APPLY BUTTON */}

                {hasApplyUrl ? (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Apply Now
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-300 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Apply Link Unavailable
                  </button>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Always verify the official notification before submitting
                  your application.
                </p>
              </div>
            </div>

            {/* AGE LIMIT */}

            {job.ageLimit && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-5 sm:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <FaUserClock />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    Age Limit
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {job.ageLimit}
                  </p>
                </div>
              </div>
            )}

            {/* STUDY PLAN */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <FaGraduationCap />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Start Preparing
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add this opportunity to your preparation plan and start
                  tracking your progress.
                </p>

                <Link
                  to="/study-plan"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

export default JobDetails;