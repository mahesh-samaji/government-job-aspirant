import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaGraduationCap,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
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

    if (!token) {
      setError(
        "Password reset link is invalid. Please request a new reset link."
      );
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    // Password validation
    if (formData.password.length < 12) {
      setError(
        "Password must be at least 12 characters long."
      );
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError(
        "Password must contain at least one number."
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      setError(
        "Password must contain at least one special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset password. Please try again."
        );
        return;
      }

      setResetSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUCCESS STATE
  ========================================================== */

  if (resetSuccess) {
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
                PASSWORD UPDATED
              </span>

              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
                You're Ready
                <br />
                <span className="text-blue-100">
                  To Continue.
                </span>
              </h1>

              <p className="text-base xl:text-lg text-blue-100 leading-8 max-w-lg mb-8">
                Your password has been successfully updated. You can now
                securely access your GovPrep account.
              </p>

              <div className="space-y-4">

                <div className="flex items-center gap-3 text-blue-50">
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                    ✓
                  </span>
                  <span>Password successfully updated</span>
                </div>

                <div className="flex items-center gap-3 text-blue-50">
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                    ✓
                  </span>
                  <span>Account security maintained</span>
                </div>

                <div className="flex items-center gap-3 text-blue-50">
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                    ✓
                  </span>
                  <span>Continue your preparation journey</span>
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

            {/* SUCCESS */}
            <div className="text-center">

              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-5xl">
                <FaCheckCircle />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Password Reset Successful
              </h2>

              <p className="text-sm sm:text-base text-slate-500 leading-7 mb-8">
                Your password has been updated successfully. You can now log
                in using your new password.
              </p>

              <button
                type="button"
                className="w-full h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-3 text-sm font-semibold shadow-sm hover:bg-blue-700 active:bg-blue-800 transition"
                onClick={() => navigate("/login")}
              >
                <span>Go to Login</span>
                <FaArrowRight className="text-xs" />
              </button>

            </div>

            {/* BACK HOME */}
            <p className="text-center mt-8">
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
  }

  /* =========================================================
     RESET PASSWORD FORM
  ========================================================== */

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
              CREATE NEW PASSWORD
            </span>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Secure Your
              <br />
              <span className="text-blue-100">
                GovPrep Account.
              </span>
            </h1>

            <p className="text-base xl:text-lg text-blue-100 leading-8 max-w-lg mb-8">
              Create a strong new password and get back to your government job
              preparation journey.
            </p>

            <div className="space-y-4">

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <span>Use at least 12 characters</span>
              </div>

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <span>Include uppercase, lowercase and numbers</span>
              </div>

              <div className="flex items-center gap-3 text-blue-50">
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <span>Include at least one special character</span>
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
              Reset Your Password
            </h2>

            <p className="text-sm sm:text-base text-slate-500">
              Enter your new password below to secure your account.
            </p>

          </div>


          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* NEW PASSWORD */}
            <div>

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                New Password
              </label>

              <div className="relative">

                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full h-12 rounded-lg border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Confirm New Password
              </label>

              <div className="relative">

                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full h-12 rounded-lg border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>


            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-3 text-sm font-semibold shadow-sm hover:bg-blue-700 active:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}
              </span>

              {!loading && (
                <FaArrowRight className="text-xs" />
              )}
            </button>

          </form>


          {/* LOGIN */}
          <p className="text-center text-sm text-slate-500 mt-7">

            Remember your password?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 no-underline transition"
            >
              Back to Login
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

export default ResetPassword;