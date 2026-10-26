import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaArrowRight,
  FaBriefcase,
  FaClock,
} from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    qualification: "",
    preferredJob: "",
    preparationLevel: "",
    studyHours: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Required field validation
    if (!formData.name || !formData.email) {
      setError("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Send name and email to backend
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Registration failed. Please try again."
        );
        return;
      }

      // Save registration information temporarily
      // Password is NOT stored here.
      sessionStorage.setItem(
        "registrationData",
        JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          qualification: formData.qualification,
          preferredJob: formData.preferredJob,
          preparationLevel: formData.preparationLevel,
          studyHours: formData.studyHours,
        })
      );

      // Remove any old OTP verification status
      sessionStorage.removeItem("otpVerified");

      // Go to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="w-full max-w-xl mx-auto px-10 py-12 flex flex-col justify-center">

          <Link
            to="/"
            className="inline-flex items-center gap-3 text-white no-underline mb-16 w-fit"
          >
            <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
              <FaGraduationCap />
            </span>

            <span className="text-2xl font-bold tracking-tight">
              GovPrep
            </span>
          </Link>

          <div>

            <span className="inline-block text-xs font-bold tracking-[0.2em] text-blue-100 mb-5">
              START YOUR JOURNEY
            </span>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Your Goal.
              <br />

              <span className="text-blue-100">
                Your Preparation.
              </span>
            </h1>

            <p className="text-base xl:text-lg text-blue-100 leading-8 max-w-lg mb-8">
              Create your GovPrep account and build a preparation journey
              around your government job goal.
            </p>

            <div className="space-y-4">

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>

                <span>Discover relevant government jobs</span>
              </div>

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>

                <span>Get personalized preparation</span>
              </div>

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>

                <span>Track your progress</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 min-h-screen flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 bg-white">

        <div className="w-full max-w-2xl">

          {/* MOBILE LOGO */}
          <div className="flex lg:hidden justify-center mb-8">

            <Link
              to="/"
              className="inline-flex items-center gap-3 text-slate-900 no-underline"
            >
              <span className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                <FaGraduationCap />
              </span>

              <span className="text-2xl font-bold">
                GovPrep
              </span>
            </Link>

          </div>

          {/* HEADER */}
          <div className="mb-7">

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Create Your Account
            </h2>

            <p className="text-sm sm:text-base text-slate-500">
              Tell us a little about yourself to personalize your preparation.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME + EMAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAME */}
              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Full Name
                </label>

                <div className="relative">

                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />

                </div>
              </div>

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email Address
                </label>

                <div className="relative">

                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />

                </div>
              </div>

            </div>

            {/* QUALIFICATION + JOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* QUALIFICATION */}
              <div>

                <label
                  htmlFor="qualification"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Educational Qualification
                </label>

                <div className="relative">

                  <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />

                  <select
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      Select qualification
                    </option>

                    <option value="10th">
                      10th Pass
                    </option>

                    <option value="12th">
                      12th Pass
                    </option>

                    <option value="diploma">
                      Diploma
                    </option>

                    <option value="graduation">
                      Graduation
                    </option>

                    <option value="post-graduation">
                      Post Graduation
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>
              </div>

              {/* PREFERRED JOB */}
              <div>

                <label
                  htmlFor="preferredJob"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Preferred Job
                </label>

                <div className="relative">

                  <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />

                  <select
                    id="preferredJob"
                    name="preferredJob"
                    value={formData.preferredJob}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      Select job type
                    </option>

                    <option value="ssc">
                      SSC Jobs
                    </option>

                    <option value="banking">
                      Banking Jobs
                    </option>

                    <option value="railway">
                      Railway Jobs
                    </option>

                    <option value="upsc">
                      UPSC Jobs
                    </option>

                    <option value="state-government">
                      State Government Jobs
                    </option>

                    <option value="defence">
                      Defence Jobs
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>
              </div>

            </div>

            {/* PREPARATION + STUDY HOURS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* PREPARATION LEVEL */}
              <div>

                <label
                  htmlFor="preparationLevel"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Preparation Level
                </label>

                <select
                  id="preparationLevel"
                  name="preparationLevel"
                  value={formData.preparationLevel}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    Select level
                  </option>

                  <option value="beginner">
                    Beginner
                  </option>

                  <option value="intermediate">
                    Intermediate
                  </option>

                  <option value="advanced">
                    Advanced
                  </option>

                </select>

              </div>

              {/* STUDY HOURS */}
              <div>

                <label
                  htmlFor="studyHours"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Available Study Time
                </label>

                <div className="relative">

                  <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />

                  <select
                    id="studyHours"
                    name="studyHours"
                    value={formData.studyHours}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      Select hours
                    </option>

                    <option value="1-2">
                      1–2 hours/day
                    </option>

                    <option value="2-4">
                      2–4 hours/day
                    </option>

                    <option value="4-6">
                      4–6 hours/day
                    </option>

                    <option value="6-8">
                      6–8 hours/day
                    </option>

                    <option value="8+">
                      8+ hours/day
                    </option>

                  </select>

                </div>
              </div>

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-3 text-sm font-semibold shadow-sm hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>Continue with Email Verification</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>

          </form>

          {/* LOGIN */}
          <p className="text-center text-sm text-slate-500 mt-7">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 no-underline transition"
            >
              Login here
            </Link>

          </p>

          {/* BACK HOME */}
          <p className="text-center mt-5">

            <Link
              to="/"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 no-underline transition"
            >
              ← Back to Home
            </Link>

          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;