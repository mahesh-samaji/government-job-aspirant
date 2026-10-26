
import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import RoadmapCard from "../../components/roadmap/RoadmapCard";

const API_URL = "http://localhost:5000/api/roadmaps";

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        setError("");

        // Get the JWT token of the logged-in user.
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in to view your roadmaps.");
        }

        // Request roadmaps with authentication.
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              "Your session may have expired. Please log in again."
            );
          }

          throw new Error(data.message || "Failed to load roadmaps.");
        }

        const fetchedRoadmaps = data.roadmaps || [];

        // Use the progress returned by the backend.
        const updatedRoadmaps = fetchedRoadmaps.map((roadmap) => {
          const totalSteps =
            roadmap.totalSteps ?? roadmap.steps?.length ?? 0;

          const completedSteps =
            roadmap.completedStepsCount ??
            roadmap.completedSteps?.length ??
            0;

          const progress =
            roadmap.progress ??
            (totalSteps > 0
              ? Math.round((completedSteps / totalSteps) * 100)
              : 0);

          return {
            ...roadmap,
            id: roadmap._id,
            totalSteps,
            completedSteps,
            progress,
          };
        });

        setRoadmaps(updatedRoadmaps);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load roadmaps. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title="Career & Exam Roadmaps"
        subtitle="Choose a preparation roadmap and follow a clear path toward your government job goal."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* INTRODUCTION */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Choose Your Preparation Path
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              Roadmaps break your preparation into manageable steps. Follow
              the recommended sequence, track your progress, and improve your
              preparation consistently.
            </p>
          </div>
        </div>

        {/* ROADMAPS */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Available Roadmaps
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select a roadmap based on the government exam you want to
              prepare for.
            </p>
          </div>

          {loading && (
            <div className="rounded-xl border border-emerald-100 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />
                <p>Loading roadmaps...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && roadmaps.length === 0 && (
            <div className="rounded-xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 6.5v11m-5.5-5.5h11M4.75 3.75h14.5a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H4.75a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z"
                  />
                </svg>
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                No roadmaps available
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No roadmaps are available right now. Please check again later.
              </p>
            </div>
          )}

          {!loading && !error && roadmaps.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <RoadmapCard
                  key={roadmap.id}
                  id={roadmap.id}
                  title={roadmap.title}
                  description={roadmap.description}
                  duration={roadmap.duration}
                  progress={roadmap.progress}
                  completedSteps={roadmap.completedSteps}
                  totalSteps={roadmap.totalSteps}
                />
              ))}
            </div>
          )}
        </section>

        {/* PREPARATION TIP */}
        <div className="mt-8 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Preparation Tip
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Don't try to complete everything at once. Follow one roadmap
                  consistently, revise completed topics regularly, and use
                  mock tests to measure your improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
