import React from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaBookOpen,
  FaChartLine,
  FaBell,
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaChevronRight,
} from "react-icons/fa";

const LandingPage = () => {
  const features = [
    {
      icon: <FaSearch />,
      title: "Discover Jobs",
      description:
        "Find government job notifications based on your qualification, interests and preferences.",
    },
    {
      icon: <FaBookOpen />,
      title: "Prepare Smarter",
      description:
        "Access exam details, syllabus, resources and structured preparation plans in one place.",
    },
    {
      icon: <FaChartLine />,
      title: "Track Progress",
      description:
        "Monitor study hours, accuracy, subject performance and your overall preparation journey.",
    },
    {
      icon: <FaBell />,
      title: "Never Miss Updates",
      description:
        "Stay updated with application deadlines, admit cards, exams, results and important alerts.",
    },
  ];

  const benefits = [
    "Personalized government job recommendations",
    "Complete exam and syllabus information",
    "Customized study plans",
    "Previous year papers and cutoffs",
    "Progress and performance tracking",
    "Important deadline notifications",
  ];

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-slate-900">

      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* LOGO */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg text-white shadow-sm shadow-emerald-600/20 transition duration-300 group-hover:scale-105">
              <FaBookOpen />
            </div>

            <span className="text-[21px] font-extrabold tracking-tight text-slate-950">
              Gov<span className="text-emerald-600">Prep</span>
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-9 md:flex">
            <Link
              to="/"
              className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              Contact
            </Link>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="hidden rounded-lg border border-emerald-200 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:border-emerald-300 hover:bg-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition duration-200 hover:from-emerald-600 hover:to-teal-700 hover:shadow-md hover:shadow-emerald-600/20"
            >
              Get Started
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <section
          className="relative overflow-hidden border-b border-emerald-100"
          style={{
            background:
              "radial-gradient(circle at 10% 20%, rgba(16,185,129,0.22), transparent 32%), radial-gradient(circle at 90% 15%, rgba(34,197,94,0.18), transparent 30%), radial-gradient(circle at 70% 90%, rgba(5,150,105,0.14), transparent 35%), linear-gradient(135deg, #ECFDF5 0%, #F7FFF9 45%, #E8F8EF 100%)",
          }}
        >

          {/* BACKGROUND GLOW */}
          <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 top-0 h-\[28rem\] w-\[28rem\] rounded-full bg-green-300/20 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-200/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">

            {/* =================================================
                HERO LEFT
            ================================================== */}
            <div className="max-w-2xl">

              {/* BADGE */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur">
                <FaCheckCircle className="text-emerald-600" />
                Built for Government Job Aspirants
              </div>

              {/* HEADING */}
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[62px]">
                Prepare smarter.
                <span className="block text-emerald-600">
                  Get closer to your goal.
                </span>
              </h1>

              {/* DESCRIPTION */}
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Discover government job opportunities, build a personalized
                preparation plan, track your progress and stay updated — all
                from one simple platform.
              </p>

              {/* BUTTONS */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20"
                >
                  Start Preparing
                  <FaArrowRight />
                </Link>

                <Link
                  to="/jobs"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition duration-300 hover:border-emerald-300 hover:bg-white"
                >
                  Explore Jobs
                  <FaChevronRight className="text-xs" />
                </Link>

              </div>

              {/* CHECK ITEMS */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <FaCheck className="text-[9px]" />
                  </span>
                  Job Alerts
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <FaCheck className="text-[9px]" />
                  </span>
                  Study Plans
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <FaCheck className="text-[9px]" />
                  </span>
                  Progress Tracking
                </div>

              </div>
            </div>

            {/* =================================================
                DASHBOARD PREVIEW
            ================================================== */}
            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">

              {/* GLOW */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-300/30 blur-3xl" />

              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-green-300/25 blur-3xl" />

              {/* CARD */}
              <div className="relative rounded-2xl border border-emerald-100 bg-white/95 p-5 shadow-[0_30px_80px_-25px_rgba(5,150,105,0.25)] backdrop-blur-sm sm:p-7">

                {/* HEADER */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Today's Preparation
                    </p>

                    <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950">
                      Keep Moving Forward
                    </h3>
                  </div>

                  {/* PROGRESS CIRCLE */}
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-emerald-100">
                    <div className="text-sm font-extrabold text-emerald-600">
                      72%
                    </div>
                  </div>

                </div>

                {/* PROGRESS BAR */}
                <div className="mt-7">

                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Daily progress
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      72%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-emerald-50">
                    <div className="h-full w-[72%] rounded-full bg-emerald-500" />
                  </div>

                </div>

                {/* STATS */}
                <div className="mt-7 grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-emerald-50 bg-[#F7FDF9] p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Study Hours
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-950">
                      4.5h
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-50 bg-[#F7FDF9] p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Tasks Done
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-950">
                      8/10
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-50 bg-[#F7FDF9] p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Accuracy
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-950">
                      84%
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-50 bg-[#F7FDF9] p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Streak
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-950">
                      12 Days
                    </p>
                  </div>

                </div>

                {/* TODAY'S TASKS */}
                <div className="mt-6">

                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Today's tasks
                  </p>

                  {/* COMPLETED TASK */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <FaCheck className="text-xs" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        Quantitative Aptitude
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Completed · 60 minutes
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-emerald-600">
                      Done
                    </span>

                  </div>

                  {/* PENDING TASK */}
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

                    <div className="h-7 w-7 shrink-0 rounded-full border-2 border-slate-200" />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        Reasoning Practice
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Pending · 45 minutes
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      Pending
                    </span>

                  </div>

                </div>
              </div>

              {/* FLOATING STAT CARD */}
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-xl shadow-emerald-900/10 sm:flex">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FaChartLine />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Weekly accuracy
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    +12.5%
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES SECTION
        ====================================================== */}
        <section
          className="relative overflow-hidden px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
          style={{
            background:
              "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 45%, #F7FFF9 100%)",
          }}
        >

          {/* BACKGROUND GLOW */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">

            {/* SECTION HEADER */}
            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Everything You Need
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                One platform for your entire preparation journey.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                From finding the right opportunity to preparing for the exam,
                GovPrep keeps everything organized in one place.
              </p>

            </div>

            {/* FEATURE CARDS */}
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50"
                >

                  {/* ICON */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>

                  <Link
                    to="/register"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-600"
                  >
                    Learn More
                    <FaArrowRight className="text-[10px] transition group-hover:translate-x-1" />
                  </Link>

                </div>
              ))}

            </div>
          </div>
        </section>

        {/* =====================================================
            BENEFITS SECTION
        ====================================================== */}
        <section
          className="relative overflow-hidden border-y border-emerald-100 px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
          style={{
            background:
              "radial-gradient(circle at 85% 40%, rgba(16,185,129,0.18), transparent 35%), radial-gradient(circle at 10% 70%, rgba(34,197,94,0.14), transparent 30%), linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 48%, #ECFDF5 100%)",
          }}
        >

          {/* GLOWS */}
          <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-green-300/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-24">

            {/* LEFT */}
            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Why GovPrep?
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                Stop searching everywhere.
                <span className="block text-emerald-600">
                  Prepare in one place.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
                Government exam preparation becomes difficult when job
                notifications, syllabus, study materials and deadlines are
                spread across different platforms.
              </p>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                GovPrep brings the important pieces together so you can spend
                less time searching and more time preparing.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Create Your Account
                <FaArrowRight />
              </Link>

            </div>

            {/* RIGHT */}
            <div className="rounded-2xl border border-emerald-100 bg-white/95 p-5 shadow-xl shadow-emerald-900/10 backdrop-blur sm:p-7">

              <div className="space-y-3">

                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-4 rounded-xl border border-transparent bg-[#F0FDF4] p-4 transition hover:border-emerald-100 hover:bg-emerald-50"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <FaCheck className="text-xs" />
                    </div>

                    <span className="text-sm font-semibold text-slate-700 sm:text-base">
                      {benefit}
                    </span>

                  </div>
                ))}

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}
        <section className="relative overflow-hidden bg-[#F0FDF4] px-5 py-20 sm:px-6 lg:px-8 lg:py-24">

          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-blue-600 px-6 py-16 text-center shadow-2xl shadow-blue-600/20 sm:px-10">

            {/* CTA GLOW */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                Start Today
              </p>

              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your government job journey starts here.
              </h2>

              <p className="mt-4 text-base font-medium text-blue-100 sm:text-lg">
                Discover. Prepare. Track. Improve. Achieve.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-blue-600 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Get Started
                <FaArrowRight />
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-800 bg-slate-950 px-5 py-12 text-white sm:px-6 lg:px-8">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">

          {/* FOOTER BRAND */}
          <div className="max-w-md">

            <Link to="/" className="inline-flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FaBookOpen />
              </span>

              <span className="text-xl font-extrabold">
                Gov<span className="text-blue-400">Prep</span>
              </span>

            </Link>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Helping government job aspirants discover opportunities and
              prepare smarter.
            </p>

          </div>

          {/* FOOTER LINKS */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-400">

            <Link
              to="/about"
              className="transition hover:text-white"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>

            <Link
              to="/login"
              className="transition hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="transition hover:text-white"
            >
              Register
            </Link>

          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6">

          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} GovPrep. All rights reserved.
          </p>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;