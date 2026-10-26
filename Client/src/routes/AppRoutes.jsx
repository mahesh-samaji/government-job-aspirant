import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";


// Public Pages
import LandingPage from "../pages/public/LandingPage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";

// Authentication Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import SetPassword from "../pages/auth/SetPassword";

// Dashboard Pages
import Dashboard from "../pages/dashboard/Dashboard";
import Jobs from "../pages/dashboard/Jobs";
import JobDetails from "../pages/dashboard/JobDetails";
import Exams from "../pages/dashboard/Exams";
import ExamDetails from "../pages/dashboard/ExamDetails";
import StudyPlan from "../pages/dashboard/StudyPlan";
import Notifications from "../pages/dashboard/Notifications";
import Roadmaps from "../pages/dashboard/Roadmaps";
import Profile from "../pages/dashboard/Profile";
import Settings from "../pages/dashboard/Settings";
import RoadmapDetails from "../pages/dashboard/RoadmapDetails";


// Route Protection
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// Dashboard Layout
import DashboardLayout from "../components/layout/DashboardLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/set-password" element={<SetPassword />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />
        </Route>

        <Route path="/" element={<LandingPage />} />

        <Route path="/about" element={<AboutPage />} />

        <Route path="/contact" element={<ContactPage />} />

        {/* ================= PROTECTED ROUTES ================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Jobs */}
            <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/jobs/:id"
              element={<JobDetails />}
            />

            {/* Exams */}
            <Route
              path="/exams"
              element={<Exams />}
            />

            <Route
              path="/exams/:id"
              element={<ExamDetails />}
            />

            {/* Study Plan */}
            <Route
              path="/study-plan"
              element={<StudyPlan />}
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* Roadmaps */}
            <Route
              path="/roadmaps"
              element={<Roadmaps />}
            />

                      <Route
            path="/roadmaps/:id"
            element={<RoadmapDetails />}
          />

            {/* Account */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Route>
        </Route>

        {/* ================= 404 ROUTE ================= */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
                <h1 className="text-6xl font-extrabold tracking-tight text-blue-600">
                  404
                </h1>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  Page Not Found
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                  The page you are looking for does not exist.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;