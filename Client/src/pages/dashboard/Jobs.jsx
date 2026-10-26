import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaBriefcase,
  FaSlidersH,
  FaCheckCircle,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";
import JobCard from "../../components/jobs/JobCard";
import JobFilters from "../../components/jobs/JobFilters";

const Jobs = () => {
  // Search and filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [qualification, setQualification] = useState("");
  const [location, setLocation] = useState("");

  // Jobs from backend
  const [jobs, setJobs] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch jobs from backend
  // --------------------------------------------------
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/jobs"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch jobs."
          );
        }

        setJobs(data.jobs || []);
      } catch (error) {
        console.error("Fetch jobs error:", error);

        setError(
          "Unable to load jobs. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // --------------------------------------------------
  // Filter jobs
  // --------------------------------------------------
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        job.title?.toLowerCase().includes(searchText) ||
        job.organization?.toLowerCase().includes(searchText);

      const matchesCategory =
        !category || job.category === category;

      const matchesQualification =
        !qualification ||
        job.qualification?.includes(qualification);

      const matchesLocation =
        !location || job.location === location;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesQualification &&
        matchesLocation
      );
    });
  }, [
    jobs,
    search,
    category,
    qualification,
    location,
  ]);

  // --------------------------------------------------
  // Reset all filters
  // --------------------------------------------------
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setQualification("");
    setLocation("");
  };

  const hasActiveFilters =
    search || category || qualification || location;

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/70 via-slate-50 to-teal-50/60">
      {/* PAGE HEADER */}
      <PageHeader
        title="Government Jobs"
        subtitle="Discover the latest government job opportunities and find the right career path for you."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <FaPlus className="text-xs" />
            Add Alert
          </button>
        }
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">

        {/* SEARCH SECTION */}
        <section className="relative mb-7 overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 shadow-sm backdrop-blur-sm">
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-teal-100/50 blur-3xl" />

          <div className="relative p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <FaSearch className="text-xs" />
                  </div>

                  <h2 className="text-base font-bold text-slate-900">
                    Find your next opportunity
                  </h2>
                </div>

                <p className="mt-1.5 pl-10 text-xs text-slate-500 sm:text-sm">
                  Search by job title or organization
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="self-start text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 sm:self-auto"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

              <input
                type="text"
                placeholder="Search jobs, organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-emerald-200 hover:bg-white focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>
        </section>

        {/* FILTER SECTION */}
        <section className="mb-9">
          <div className="mb-3 flex items-center gap-2 px-1">
            <FaSlidersH className="text-sm text-emerald-600" />

            <h2 className="text-sm font-bold text-slate-800">
              Filter opportunities
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <JobFilters
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              qualification={qualification}
              setQualification={setQualification}
              location={location}
              setLocation={setLocation}
              onReset={resetFilters}
            />
          </div>
        </section>

        {/* RESULTS HEADER */}
        <section className="mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FaBriefcase className="text-emerald-600" />

                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Latest Opportunities
                </h2>
              </div>

              <p className="mt-1.5 text-sm text-slate-500">
                {loading
                  ? "Searching available opportunities..."
                  : "Explore government jobs matching your preferences."}
              </p>
            </div>

            {!loading && !error && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5">
                <FaCheckCircle className="text-xs text-emerald-600" />

                <span className="text-xs font-bold text-emerald-700">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1
                    ? "job"
                    : "jobs"}{" "}
                  found
                </span>
              </div>
            )}
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-700">
              Loading government jobs...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Finding the latest opportunities for you
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <FaBriefcase className="text-red-500" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-red-800">
              Unable to Load Jobs
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* RESULTS */}
        {!loading &&
          !error &&
          filteredJobs.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  id={job._id}
                  title={job.title}
                  organization={job.organization}
                  location={job.location}
                  lastDate={
                    job.applicationEndDate
                      ? new Date(
                          job.applicationEndDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Not specified"
                  }
                  qualification={
                    job.qualification?.length > 0
                      ? job.qualification.join(", ")
                      : "Not specified"
                  }
                  jobType={job.category}
                />
              ))}
            </div>
          )}

        {/* NO RESULTS */}
        {!loading &&
          !error &&
          filteredJobs.length === 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
              <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <FaSearch className="text-xl" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No Jobs Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find any government jobs matching your current
                  search and filters. Try adjusting your criteria.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
};

export default Jobs;