
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaBriefcase,
  FaBookOpen,
  FaClock,
  FaEdit,
  FaSave,
} from "react-icons/fa";

import PageHeader from "../../components/layout/PageHeader";

const API_URL = "http://localhost:5000/api/users/me";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  qualification: "",
  preferredJob: "",
  preparationLevel: "",
  studyHours: "",
};

const fieldClass = (isEditing) =>
  `w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
    isEditing
      ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600"
  }`;

const iconFieldClass = (isEditing) =>
  `${fieldClass(isEditing)} pl-11`;

const Profile = () => {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please login again."
              : data.message || "Unable to load your profile."
          );
        }

        const user = data.user;

        const normalizedProfile = {
          name: user.name || "",
          email: user.email || "",
          qualification: user.qualification || "",
          preferredJob: user.preferredJob || "",
          preparationLevel: user.preparationLevel || "",
          studyHours: user.studyHours || "",
        };

        setProfile(normalizedProfile);
        setSavedProfile(normalizedProfile);

        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profile.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (profile.name.trim().length > 100) {
      setError("Name cannot exceed 100 characters.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          qualification: profile.qualification,
          preferredJob: profile.preferredJob,
          preparationLevel: profile.preparationLevel,
          studyHours: profile.studyHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your profile.");
      }

      const user = data.user;

      const normalizedProfile = {
        name: user.name || "",
        email: user.email || "",
        qualification: user.qualification || "",
        preferredJob: user.preferredJob || "",
        preparationLevel: user.preparationLevel || "",
        studyHours: user.studyHours || "",
      };

      setProfile(normalizedProfile);
      setSavedProfile(normalizedProfile);
      setIsEditing(false);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("Your profile has been saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const renderSelect = (id, label, icon, options, value) => (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-emerald-600">
            {icon}
          </span>
        )}

        <select
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          disabled={!isEditing || loading || saving}
          className={`${
            icon ? iconFieldClass(isEditing) : fieldClass(isEditing)
          } ${icon ? "appearance-none" : ""}`}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and preparation preferences."
        actions={
          loading ? null : isEditing ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="profile-form"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSave />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          )
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            Loading your profile...
          </div>
        ) : (
          <form id="profile-form" onSubmit={handleSave}>
            <fieldset disabled={saving} className="min-w-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* PERSONAL INFORMATION */}
                <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-50 px-5 py-5 sm:px-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Personal Information
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Your basic account information.
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <FaUser />
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Full Name
                      </label>

                      <div className="relative">
                        <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />

                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          maxLength={100}
                          autoComplete="name"
                          className={iconFieldClass(isEditing)}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={profile.email}
                          disabled
                          readOnly
                          className={iconFieldClass(false)}
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-slate-500">
                        Your email address cannot be changed here.
                      </p>
                    </div>
                  </div>
                </section>

                {/* PREPARATION INFORMATION */}
                <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-50 px-5 py-5 sm:px-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Preparation Profile
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Your government job preparation preferences.
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <FaBookOpen />
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    {renderSelect(
                      "qualification",
                      "Educational Qualification",
                      <FaGraduationCap />,
                      [
                        { value: "10th", label: "10th Pass" },
                        { value: "12th", label: "12th Pass" },
                        { value: "Diploma", label: "Diploma" },
                        { value: "Graduate", label: "Graduate" },
                        { value: "Post Graduate", label: "Post Graduate" },
                      ],
                      profile.qualification
                    )}

                    {renderSelect(
                      "preferredJob",
                      "Preferred Government Job",
                      <FaBriefcase />,
                      [
                        { value: "SSC", label: "SSC" },
                        { value: "Banking", label: "Banking" },
                        { value: "Railway", label: "Railway" },
                        { value: "UPSC", label: "UPSC" },
                        { value: "Defence", label: "Defence" },
                        {
                          value: "State Government",
                          label: "State Government",
                        },
                      ],
                      profile.preferredJob
                    )}

                    {renderSelect(
                      "preparationLevel",
                      "Preparation Level",
                      null,
                      [
                        { value: "Beginner", label: "Beginner" },
                        { value: "Intermediate", label: "Intermediate" },
                        { value: "Advanced", label: "Advanced" },
                      ],
                      profile.preparationLevel
                    )}

                    {renderSelect(
                      "studyHours",
                      "Available Study Time",
                      <FaClock />,
                      [
                        { value: "1-2 Hours", label: "1-2 Hours" },
                        { value: "3-4 Hours", label: "3-4 Hours" },
                        { value: "5-6 Hours", label: "5-6 Hours" },
                        { value: "7+ Hours", label: "7+ Hours" },
                      ],
                      profile.studyHours
                    )}
                  </div>
                </section>
              </div>

              {/* PROFILE SUMMARY */}
              <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <div className="border-b border-emerald-50 px-5 py-5 sm:px-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Preparation Summary
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your current profile is used to personalize your preparation
                    experience.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Qualification",
                        value: profile.qualification,
                        icon: <FaGraduationCap />,
                      },
                      {
                        label: "Preferred Job",
                        value: profile.preferredJob,
                        icon: <FaBriefcase />,
                      },
                      {
                        label: "Preparation Level",
                        value: profile.preparationLevel,
                        icon: <FaBookOpen />,
                      },
                      {
                        label: "Study Time",
                        value: profile.studyHours,
                        icon: <FaClock />,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50/70 to-teal-50/70 p-4 transition hover:border-emerald-200 hover:shadow-sm"
                      >
                        <div className="text-xl text-emerald-600">
                          {item.icon}
                        </div>

                        <span className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                          {item.label}
                        </span>

                        <strong className="mt-1 block text-sm font-bold text-slate-900">
                          {item.value || "Not set"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </fieldset>
          </form>
        )}

        {/* ACCOUNT SETTINGS */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Need to manage your account?
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Update notification preferences, password, and other account
                settings.
              </p>
            </div>

            <Link
              to="/settings"
              className="inline-flex w-full items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 hover:text-teal-700 sm:w-auto"
            >
              Account Settings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
