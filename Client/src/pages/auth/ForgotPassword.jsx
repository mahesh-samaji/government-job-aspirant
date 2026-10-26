import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaEnvelope,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to send password reset link."
        );
        return;
      }

      setEmail(normalizedEmail);
      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">

      {/* =====================================================
          LEFT SIDE - BRAND
      ====================================================== */}
      <div className="hidden min-h-screen w-1/2 bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 lg:flex">
        <div className="mx-auto flex w-full max-w-xl flex-col justify-center px-12 xl:px-20">

          {/* Logo */}
          <Link
            to="/"
            className="mb-16 inline-flex w-fit items-center gap-3 text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur-sm">
              <FaGraduationCap />
            </span>

            <span className="text-2xl font-bold tracking-tight">
              GovPrep
            </span>
          </Link>

          {/* Content */}
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-blue-100">
              ACCOUNT RECOVERY
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Get Back to
              <br />
              <span className="text-blue-100">
                Your Preparation.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-blue-100">
              Don't worry if you forgot your password. Enter your registered
              email address and continue with the password recovery process.
            </p>

            {/* Points */}
            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                Secure account recovery
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                Simple password reset process
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                Continue your preparation journey
              </div>

            </div>
          </div>
        </div>
      </div>


      {/* =====================================================
          RIGHT SIDE - FORM
      ====================================================== */}
      <div className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2 lg:px-12">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="mb-10 flex justify-center lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-blue-600"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                <FaGraduationCap />
              </span>

              <span className="text-2xl font-bold">
                GovPrep
              </span>
            </Link>
          </div>


          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Forgot Password?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter your registered email address to reset your password.
                </p>
              </div>


              {/* Error */}
              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}


              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                      required
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        pl-11
                        pr-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                        disabled:cursor-not-allowed
                        disabled:bg-slate-100
                      "
                    />
                  </div>
                </div>


                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-blue-600
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-blue-700
                    hover:shadow-md
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? "Sending..." : "Continue"}

                  {!loading && (
                    <FaArrowRight className="text-xs" />
                  )}
                </button>

              </form>
            </>
          ) : (

            /* =================================================
               SUCCESS STATE
            ================================================== */
            <div className="text-center">

              {/* Success Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600">
                <FaCheckCircle />
              </div>

              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
                Check Your Email
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                Password reset instructions have been sent to{" "}
                <strong className="font-semibold text-slate-700">
                  {email}
                </strong>
                .
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Please check your inbox and click the password reset link.
                The link will expire in 10 minutes.
              </p>

            </div>
          )}


          {/* Back to Login */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-800"
            >
              Back to Login
            </Link>
          </p>


          {/* Back Home */}
          <p className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
            >
              ← Back to Home
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;