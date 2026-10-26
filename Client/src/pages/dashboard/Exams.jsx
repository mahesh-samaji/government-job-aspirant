import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";
import ExamCard from "../../components/exams/ExamCard";
import ExamFilters from "../../components/exams/ExamFilters";

const Exams = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [conductingBody, setConductingBody] = useState("");

  // Exams from backend
  const [exams, setExams] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch exams from backend
  // --------------------------------------------------
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/exams"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch exams."
          );
        }

        setExams(data.exams || []);
      } catch (error) {
        console.error("Fetch exams error:", error);

        setError(
          "Unable to load exams. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // --------------------------------------------------
  // Filter exams
  // --------------------------------------------------
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const searchText = search.toLowerCase().trim();

      const examName = exam.name?.toLowerCase() || "";

      const organization =
        exam.organization?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        examName.includes(searchText) ||
        organization.includes(searchText);

      const matchesCategory =
        !category || exam.category === category;

      const matchesConductingBody =
        !conductingBody ||
        exam.organization === conductingBody;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesConductingBody
      );
    });
  }, [
    exams,
    search,
    category,
    conductingBody,
  ]);

  // --------------------------------------------------
  // Reset filters
  // --------------------------------------------------
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setConductingBody("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <PageHeader
        title="Government Exams"
        subtitle="Explore upcoming government exams and plan your preparation."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition duration-200 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <FaPlus />
            Add Exam
          </button>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">

        {/* =====================================================
            SEARCH
        ====================================================== */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">

          <div className="p-4 sm:p-5">

            <div className="relative">

              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />

              <input
                type="text"
                placeholder="Search exams, organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>
        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}
        <div className="mb-8">
          <ExamFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            conductingBody={conductingBody}
            setConductingBody={setConductingBody}
            onReset={resetFilters}
          />
        </div>

        {/* =====================================================
            RESULTS HEADER
        ====================================================== */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaSearch className="text-sm" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Upcoming Exams
              </h2>

            </div>

            <p className="mt-2 text-sm text-slate-500 sm:pl-11">
              {loading
                ? "Loading exams..."
                : `${filteredExams.length} exams found`}
            </p>

          </div>

        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">

            <div className="flex min-h-65 flex-col items-center justify-center px-6 py-10 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">

                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Loading Exams
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Fetching the latest government exams...
              </p>

            </div>

          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 shadow-sm">

            <div className="flex min-h-65 flex-col items-center justify-center px-6 py-10 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
                <FaSearch className="text-xl" />
              </div>

              <h3 className="text-lg font-bold text-red-800">
                Unable to Load Exams
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =====================================================
            RESULTS
        ====================================================== */}
        {!loading &&
          !error &&
          filteredExams.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredExams.map((exam) => (
                <ExamCard
                  key={exam._id}
                  id={exam._id}
                  name={exam.name}
                  conductingBody={exam.organization}
                  examDate={
                    exam.examDate
                      ? new Date(
                          exam.examDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "To Be Announced"
                  }
                  applicationLastDate={
                    exam.applicationEndDate
                      ? new Date(
                          exam.applicationEndDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "To Be Announced"
                  }
                  category={exam.category}
                />
              ))}

            </div>
          )}

        {/* =====================================================
            NO RESULTS
        ====================================================== */}
        {!loading &&
          !error &&
          filteredExams.length === 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">

              <div className="flex min-h-65 flex-col items-center justify-center px-6 py-10 text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <FaSearch className="text-xl" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  No Exams Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try changing your search or filters to find
                  more government exams.
                </p>

                <button
                  type="button"
                  className="mt-5 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition duration-200 hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>

              </div>

            </div>
          )}

      </div>
    </div>
  );
};

export default Exams;