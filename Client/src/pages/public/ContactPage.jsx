
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaQuestionCircle,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact Form:", formData);

    alert("Thank you! Your message has been submitted.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50 text-slate-900">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 text-slate-900 no-underline"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg text-white shadow-sm shadow-emerald-600/20">
              <FaGraduationCap />
            </span>

            <span className="text-xl font-bold tracking-tight">
              GovPrep
            </span>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 no-underline transition hover:text-emerald-600"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-sm font-medium text-slate-600 no-underline transition hover:text-emerald-600"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm font-semibold text-emerald-600 no-underline"
            >
              Contact
            </Link>
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="hidden rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-sm shadow-emerald-600/20 transition hover:from-emerald-600 hover:to-teal-700 sm:block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= CONTACT HERO ================= */}
      <section className="bg-linear-to-br from-emerald-50 via-white to-teal-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-bold tracking-widest text-emerald-600">
            GET IN TOUCH
          </span>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            We're Here to Help
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Have a question, suggestion or need help with GovPrep?
            Send us a message and we'll be happy to hear from you.
          </p>
        </div>
      </section>

      {/* ================= CONTACT CONTENT ================= */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ================= CONTACT INFORMATION ================= */}
          <div>
            <span className="text-sm font-bold tracking-widest text-emerald-600">
              CONTACT INFORMATION
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Let's Talk About Your Preparation
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Whether you have a question about government jobs, exam
              preparation, study planning or the GovPrep platform, feel free
              to reach out.
            </p>

            {/* CONTACT DETAILS */}
            <div className="mt-8 space-y-5">
              {/* EMAIL */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <FaEnvelope />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-500">
                    Email
                  </span>

                  <strong className="block text-base text-slate-900">
                    support@govprep.com
                  </strong>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <FaPhone />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-500">
                    Phone
                  </span>

                  <strong className="block text-base text-slate-900">
                    +91 90000 00000
                  </strong>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-500">
                    Location
                  </span>

                  <strong className="block text-base text-slate-900">
                    India
                  </strong>
                </div>
              </div>
            </div>

            {/* HELP CARD */}
            <div className="mt-10 flex gap-4 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <FaQuestionCircle />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Need Help?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Tell us what you're looking for and we'll guide you in
                  the right direction.
                </p>
              </div>
            </div>
          </div>

          {/* ================= CONTACT FORM ================= */}
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
            {/* FORM HEADER */}
            <div className="border-b border-emerald-100 px-6 py-6 sm:px-8">
              <h3 className="text-xl font-bold text-slate-900">
                Send Us a Message
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Fill in the details below and submit your message.
              </p>
            </div>

            {/* FORM BODY */}
            <div className="px-6 py-6 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NAME + EMAIL */}
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* NAME */}
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold text-slate-700"
                      htmlFor="name"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold text-slate-700"
                      htmlFor="email"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* SUBJECT */}
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="subject"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="What can we help you with?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* MESSAGE */}
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="message"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    className="min-h-\[150px] w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Write your message..."
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
                >
                  <FaPaperPlane />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-linear-to-r from-emerald-600 to-teal-700 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Preparing?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
            Create your account and start building a focused preparation
            journey for your government job goal.
          </p>

          <Link
            to="/register"
            className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          {/* FOOTER LOGO */}
          <div className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600">
              <FaGraduationCap />
            </span>

            <span>GovPrep</span>
          </div>

          {/* FOOTER LINKS */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-400">
            <Link to="/" className="transition hover:text-emerald-300">
              Home
            </Link>

            <Link to="/about" className="transition hover:text-emerald-300">
              About
            </Link>

            <Link to="/contact" className="transition hover:text-emerald-300">
              Contact
            </Link>

            <Link to="/login" className="transition hover:text-emerald-300">
              Login
            </Link>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 GovPrep. Built for government job aspirants.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
