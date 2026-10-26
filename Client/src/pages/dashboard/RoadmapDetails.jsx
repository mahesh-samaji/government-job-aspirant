
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaRoute,
  FaCheckCircle,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";
import RoadmapStep from "../../components/roadmap/RoadmapStep";

const API_URL = "http://localhost:5000/api/roadmaps";

const RoadmapDetails = () => {
  const { id } = useParams();

  const [roadmap, setRoadmap] = useState(null);
  const [completedStepNumbers, setCompletedStepNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Load roadmap details and the logged-in user's saved progress.
  useEffect(() => {
    let cancelled = false;

    const fetchRoadmapDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setSaveMessage("");

        const roadmapResponse = await fetch(`${API_URL}/${id}`);
        const roadmapData = await roadmapResponse.json();

        if (!roadmapResponse.ok) {
          throw new Error(
            roadmapData.message || "Unable to load this roadmap."
          );
        }

        if (cancelled) return;

        const fetchedRoadmap = roadmapData.roadmap;

        if (!fetchedRoadmap) {
          throw new Error("The requested roadmap was not found.");
        }

        setRoadmap(fetchedRoadmap);

        const token = localStorage.getItem("token");

        if (!token) {
          setCompletedStepNumbers([]);
          setError(
            "Please log in to load and save your roadmap progress."
          );
          return;
        }

        const progressResponse = await fetch(
          `${API_URL}/${id}/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const progressData = await progressResponse.json();

        if (!progressResponse.ok) {
          if (
            progressResponse.status === 401 ||
            progressResponse.status === 403
          ) {
            throw new Error(
              "Your session may have expired. Please log in again."
            );
          }

          throw new Error(
            progressData.message || "Unable to load saved progress."
          );
        }

        if (!cancelled) {
          setCompletedStepNumbers(
            Array.isArray(progressData.completedSteps)
              ? progressData.completedSteps
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRoadmapDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Save completed steps to the backend.
  const saveProgress = useCallback(
    async (updatedSteps) => {
      const token = localStorage.getItem("token");

      if (!token) {
        setSaveMessage("Please log in to save your progress.");
        return false;
      }

      try {
        setSaving(true);
        setSaveMessage("");

        const response = await fetch(`${API_URL}/${id}/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completedSteps: updatedSteps,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            throw new Error(
              "Your session may have expired. Please log in again."
            );
          }

          throw new Error(
            data.message || "Unable to save progress."
          );
        }

        setCompletedStepNumbers(
          Array.isArray(data.completedSteps)
            ? data.completedSteps
            : updatedSteps
        );

        setSaveMessage("Progress saved successfully.");
        return true;
      } catch (err) {
        setSaveMessage(
          err.message ||
            "Unable to save progress. Please try again."
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  // Complete a step and persist the change.
  const handleComplete = async (stepNumber) => {
    if (
      saving ||
      completedStepNumbers.includes(stepNumber)
    ) {
      return;
    }

    const updatedSteps = [
      ...completedStepNumbers,
      stepNumber,
    ].sort((a, b) => a - b);

    // Save first so failed requests do not falsely confirm progress.
    await saveProgress(updatedSteps);
  };

  // Loading state.
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Loading Roadmap..."
          subtitle="Please wait while we load your preparation roadmap."
        />

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            Loading roadmap details...
          </div>
        </div>
      </div>
    );
  }

  // Roadmap not found state.
  if (!roadmap) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
        <PageHeader
          title="Roadmap Not Found"
          subtitle={
            error ||
            "The roadmap you are looking for does not exist."
          }
        />

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/roadmaps"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <FaArrowLeft />
            Back to Roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const steps = roadmap.steps || [];
  const totalSteps = steps.length;

  const completedSteps = steps.filter((step) =>
    completedStepNumbers.includes(step.stepNumber)
  ).length;

  const progress =
    totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

  const isRoadmapCompleted =
    totalSteps > 0 && completedSteps === totalSteps;

  // Calculate step statuses from the saved completion list.
  const displayedSteps = steps.map((step, index) => {
    const isCompleted = completedStepNumbers.includes(
      step.stepNumber
    );

    if (isCompleted) {
      return { ...step, status: "completed" };
    }

    const previousStepsCompleted = steps
      .slice(0, index)
      .every((previousStep) =>
        completedStepNumbers.includes(previousStep.stepNumber)
      );

    return {
      ...step,
      status: previousStepsCompleted ? "current" : "locked",
    };
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title={roadmap.title}
        subtitle={roadmap.description}
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* BACK TO ROADMAPS */}
        <Link
          to="/roadmaps"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-teal-700"
        >
          <FaArrowLeft />
          Back to Roadmaps
        </Link>

        {/* ERROR / LOGIN MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"
          >
            {error}
          </div>
        )}

        {/* OVERVIEW CARD */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 text-xl text-emerald-600">
                  <FaRoute />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Preparation Overview
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <FaClock className="text-emerald-600" />
                      {roadmap.duration}
                    </span>

                    <span className="flex items-center gap-2">
                      <FaCheckCircle className="text-teal-600" />
                      {completedSteps}/{totalSteps} Steps Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-3xl font-extrabold tracking-tight text-emerald-600">
                  {progress}%
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Overall Progress
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-6">
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-emerald-50"
                role="progressbar"
                aria-label="Roadmap completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {saving && (
              <p
                className="mt-3 text-sm font-medium text-emerald-700"
                role="status"
              >
                Saving your progress...
              </p>
            )}

            {!saving && saveMessage && (
              <p
                className={`mt-3 text-sm font-medium ${
                  saveMessage === "Progress saved successfully."
                    ? "text-emerald-700"
                    : "text-red-600"
                }`}
                role="status"
              >
                {saveMessage}
              </p>
            )}
          </div>
        </div>

        {/* COMPLETION MESSAGE */}
        {isRoadmapCompleted && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 shadow-sm">
            <div className="flex items-start gap-3 p-5 sm:p-6">
              <FaCheckCircle className="mt-1 shrink-0 text-lg text-emerald-600" />

              <div>
                <h3 className="text-lg font-bold text-emerald-800">
                  Roadmap Completed!
                </h3>

                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  Excellent work! You have completed every step in
                  this preparation roadmap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP STEPS */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Your Preparation Roadmap
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Complete each step in sequence to continue progressing
              through your preparation journey.
            </p>
          </div>

          <div className="space-y-4">
            {displayedSteps.map((step) => (
              <RoadmapStep
                key={step.stepNumber}
                stepNumber={step.stepNumber}
                title={step.title}
                description={step.description}
                status={step.status}
                onComplete={handleComplete}
                saving={saving}
              />
            ))}
          </div>
        </section>

        {/* PREPARATION TIP */}
        <div className="mt-8 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 shadow-sm">
          <div className="p-5 sm:p-6">
            <h3 className="text-lg font-bold text-slate-900">
              Preparation Tip
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Follow the roadmap consistently instead of trying to
              complete everything at once. Revise completed topics
              regularly and use practice tests to identify your weak
              areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetails;
