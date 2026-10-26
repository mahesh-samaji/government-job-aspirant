import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registrationData = JSON.parse(
    sessionStorage.getItem("registrationData") || "null"
  );

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!registrationData) {
      setError("Registration session expired. Please register again.");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: registrationData.email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      // Store the temporary backend verification token
      sessionStorage.setItem(
        "verificationToken",
        data.verificationToken
      );

      // This is only used for frontend navigation/state.
      // The backend verification token is the actual security check.
      sessionStorage.setItem("otpVerified", "true");

      navigate("/set-password");
    } catch (error) {
      console.error("OTP verification error:", error);

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
            Verify Your Email
          </h1>

          <p className="text-slate-500 mt-2">
            Enter the 6-digit OTP sent to your email.
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
        <form onSubmit={handleVerifyOTP}>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setOtp(value);
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-[0.4em]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        {/* Resend placeholder */}
        <div className="text-center mt-6">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Resend OTP
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;