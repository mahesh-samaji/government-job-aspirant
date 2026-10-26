import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    // Clear previous error
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Send login request to backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      // Handle backend errors
      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Make sure backend returned a JWT
      if (!data.token) {
        setError("Login failed. Authentication token was not received.");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Keep this for your current ProtectedRoute
      localStorage.setItem("isAuthenticated", "true");

      // Save logged-in user information
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

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
            className="inline-flex items-center gap-3 text-white no-underline mb-20 w-fit"
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
              YOUR PREPARATION PARTNER
            </span>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Prepare Today.
              <br />

              <span className="text-blue-100">
                Achieve Tomorrow.
              </span>
            </h1>

            <p className="text-base xl:text-lg text-blue-100 leading-8 max-w-lg mb-8">
              Discover government jobs, prepare for exams, track your progress
              and stay updated throughout your journey.
            </p>

            <div className="space-y-4">

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>

                <span>Personalized preparation</span>
              </div>

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>

                <span>Exam and job notifications</span>
              </div>

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>

                <span>Progress tracking</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 min-h-screen flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 bg-white">

        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}
          <div className="flex lg:hidden justify-center mb-10">

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
          <div className="mb-8">

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-sm sm:text-base text-slate-500">
              Login to continue your government job preparation.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

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
                  disabled={loading}
                  className="w-full h-12 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 no-underline transition"
                >
                  Forgot Password?
                </Link>

              </div>

              <div className="relative">

                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-12 rounded-lg border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:cursor-not-allowed"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-3 text-sm font-semibold shadow-sm hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Login</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>

          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-8">

            <div className="flex-1 h-px bg-slate-200"></div>

            <span className="text-xs font-medium text-slate-400">
              OR
            </span>

            <div className="flex-1 h-px bg-slate-200"></div>

          </div>

          {/* REGISTER */}
          <p className="text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 no-underline transition"
            >
              Create an account
            </Link>

          </p>

          {/* BACK HOME */}
          <p className="text-center mt-6">

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

export default Login;