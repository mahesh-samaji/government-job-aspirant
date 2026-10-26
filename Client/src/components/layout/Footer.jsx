
import React from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-emerald-100 bg-linear-to-br from-white via-emerald-50/30 to-teal-50/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* BRAND */}
        <div className="md:col-span-2 lg:col-span-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 transition hover:text-emerald-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
              <FaGraduationCap />
            </span>

            <span>GovPrep</span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
            A simple and organized platform to discover government jobs,
            prepare for exams, track progress and achieve your career goals.
          </p>

          {/* SOCIAL LINKS */}
          <div className="mt-6 flex items-center gap-3">
            <a
              href="#facebook"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-slate-500 transition duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              <FaFacebookF />
            </a>

            <a
              href="#twitter"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-slate-500 transition duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              <FaTwitter />
            </a>

            <a
              href="#linkedin"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-slate-500 transition duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              <FaLinkedinIn />
            </a>

            <a
              href="#instagram"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-slate-500 transition duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* PLATFORM LINKS */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-900">
            Platform
          </h3>

          <div className="flex flex-col gap-3">
            <Link
              to="/jobs"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Government Jobs
            </Link>

            <Link
              to="/exams"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Exams
            </Link>

            <Link
              to="/study-plan"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Study Plan
            </Link>
          </div>
        </div>

        {/* RESOURCES */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-900">
            Resources
          </h3>

          <div className="flex flex-col gap-3">
            <Link
              to="/notifications"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Notifications
            </Link>

            <Link
              to="/roadmaps"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Career Roadmaps
            </Link>

            <Link
              to="/about"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-900">
            Account
          </h3>

          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Create Account
            </Link>

            <Link
              to="/profile"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Profile
            </Link>

            <Link
              to="/settings"
              className="text-sm text-slate-600 transition duration-200 hover:translate-x-1 hover:text-emerald-700"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-emerald-100 bg-linear-to-r from-emerald-50/70 to-teal-50/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 sm:px-6 md:flex-row lg:px-8">
          <p className="text-center text-sm text-slate-600 md:text-left">
            © 2026 GovPrep. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              to="/about"
              className="text-sm text-slate-600 transition hover:text-emerald-700"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm text-slate-600 transition hover:text-emerald-700"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
