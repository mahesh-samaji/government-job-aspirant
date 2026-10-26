import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registrationData = JSON.parse(
    sessionStorage.getItem("registrationData") || "null"
  );

  const verificationToken = sessionStorage.getItem(
    "verificationToken"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!registrationData) {
      setError("Registration session expired. Please register again.");
      return;
    }

    if (!verificationToken) {
      setError(
        "Email verification expired. Please complete OTP verification again."
      );
      return;
    }

    // Password validation
    if (password.length < 12) {
      setError(
        "Password must be at least 12 characters long."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "Password must contain at least one number."
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError(
        "Password must contain at least one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/set-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
                name: registrationData.name,
                email: registrationData.email,
                password: password,
                verificationToken: verificationToken,

                qualification: registrationData.qualification,
                preferredJob: registrationData.preferredJob,
                preparationLevel: registrationData.preparationLevel,
                studyHours: registrationData.studyHours,
                }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to create account."
        );
        return;
      }

      // Remove temporary registration data
      sessionStorage.removeItem("registrationData");
      sessionStorage.removeItem("otpVerified");
      sessionStorage.removeItem("verificationToken");

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error("Set password error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Set Your Password
          </h1>

          <p className="text-slate-500 mt-2">
            Create a strong password for your GovPrep account.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password Rules */}
          <div className="mb-6 bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Password requirements:
            </p>

            <ul className="text-sm text-slate-500 space-y-1">
              <li>• At least 12 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
              <li>• One special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default SetPassword;