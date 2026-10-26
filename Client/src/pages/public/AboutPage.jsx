
import React from "react";
import { Link } from "react-router-dom";
import {
  FaBullseye,
  FaChartLine,
  FaClipboardCheck,
  FaGraduationCap,
  FaSearch,
  FaBell,
  FaBookOpen,
  FaArrowRight,
} from "react-icons/fa";

const AboutPage = () => {
  const features = [
    {
      icon: <FaSearch />,
      title: "Discover Government Jobs",
      description:
        "Find relevant government job opportunities and exam notifications in one place.",
    },
    {
      icon: <FaBookOpen />,
      title: "Prepare Smarter",
      description:
        "Understand exam patterns, eligibility, syllabus, books, previous papers and cutoffs.",
    },
    {
      icon: <FaChartLine />,
      title: "Track Your Progress",
      description:
        "Monitor your preparation, study consistency, subject performance and improvement areas.",
    },
    {
      icon: <FaBell />,
      title: "Never Miss Updates",
      description:
        "Stay informed about application deadlines, admit cards, exams, results and important notifications.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: <FaClipboardCheck />,
      title: "Tell Us About You",
      description:
        "Select your qualification, preferred government jobs, exams, preparation level and available study time.",
    },
    {
      number: "02",
      icon: <FaBullseye />,
      title: "Choose Your Goal",
      description:
        "Select the government exam or career path you want to focus on.",
    },
    {
      number: "03",
      icon: <FaGraduationCap />,
      title: "Follow Your Plan",
      description:
        "Get a structured preparation approach based on your exam, available time and preparation level.",
    },
    {
      number: "04",
      icon: <FaChartLine />,
      title: "Track & Improve",
      description:
        "Track your progress, identify weak areas and continuously improve your preparation.",
    },
  ];

  const values = [
    {
      title: "Discover",
      description: "Find relevant opportunities and exam information.",
    },
    {
      title: "Prepare",
      description: "Build an organized preparation approach.",
    },
    {
      title: "Track",
      description: "Measure your consistency and performance.",
    },
    {
      title: "Improve",
      description: "Focus more on your weak areas.",
    },
    {
      title: "Achieve",
      description: "Move closer to your government job goal.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/50 text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-3 text-slate-900 no-underline"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg text-white shadow-sm">
              <FaGraduationCap />
            </span>

            <span className="text-xl font-bold tracking-tight">
              GovPrep
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 no-underline transition hover:text-emerald-600"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-sm font-semibold text-emerald-600 no-underline"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm font-medium text-slate-600 no-underline transition hover:text-emerald-600"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="hidden rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-emerald-600 hover:to-teal-700 sm:block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="overflow-hidden bg-linear-to-br from-emerald-50 via-white to-teal-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          {/* HERO CONTENT */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              <FaBullseye />
              Built for Government Job Aspirants
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Journey to a
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {" "}Government Job{" "}
              </span>
              Starts With the Right Preparation
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              GovPrep is designed to bring government job discovery, exam
              preparation, study planning and progress tracking together in one
              simple platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
              >
                Start Preparing
                <FaArrowRight className="text-xs" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 no-underline transition hover:border-emerald-500 hover:text-emerald-600"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-5 shadow-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.18em] text-emerald-600">
                    YOUR PREPARATION
                  </span>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Preparation Overview
                  </h3>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-emerald-100 text-sm font-bold text-emerald-600">
                  72%
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-linear-to-r from-emerald-500 to-teal-600" />
              </div>

              {/* STATS */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <strong className="block text-xl font-bold text-slate-900">
                    6.5h
                  </strong>
                  <span className="text-xs text-slate-500">Study Time</span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <strong className="block text-xl font-bold text-slate-900">
                    82%
                  </strong>
                  <span className="text-xs text-slate-500">Accuracy</span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <strong className="block text-xl font-bold text-slate-900">
                    12
                  </strong>
                  <span className="text-xs text-slate-500">Tasks Done</span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <strong className="block text-xl font-bold text-slate-900">
                    14
                  </strong>
                  <span className="text-xs text-slate-500">Day Streak</span>
                </div>
              </div>

              {/* TASKS */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-100 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>

                  <span className="text-sm text-slate-700">
                    Complete Quantitative Aptitude
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-emerald-100 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>

                  <span className="text-sm text-slate-700">
                    Practice Previous Year Questions
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
                    ○
                  </span>

                  <span className="text-sm text-slate-500">
                    Revise General Awareness
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-emerald-600">
              OUR PURPOSE
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Making Government Exam Preparation More Organized
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Preparing for government jobs can become difficult when
              notifications, syllabi, study materials, deadlines and progress
              are spread across different platforms.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* CARD 1 */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                <FaBullseye />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                One Clear Direction
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                GovPrep helps aspirants understand what to prepare, when to
                prepare and where they need to improve.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                <FaGraduationCap />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Personalized Preparation
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Your preparation can be organized around your selected exam,
                current level and available study time.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                <FaChartLine />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Continuous Improvement
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Track your performance and identify the areas that need more
                attention instead of preparing without direction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-linear-to-br from-emerald-50/70 via-slate-50 to-teal-50/60 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-emerald-600">
              WHAT WE OFFER
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need for Your Preparation Journey
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              From discovering opportunities to tracking your preparation,
              GovPrep brings the important parts of your government-job journey
              together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-emerald-600">
              HOW IT WORKS
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A Simple Path From Goal to Achievement
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Follow a structured process instead of preparing without a clear
              roadmap.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">
                    {step.number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                    {step.icon}
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-linear-to-br from-emerald-50/70 via-slate-50 to-teal-50/60 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* CONTENT */}
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-emerald-600">
                OUR APPROACH
              </span>

              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Discover. Prepare. Track. Improve. Achieve.
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                Success in competitive exams is not only about studying more.
                It is about having the right information, following a
                consistent plan, measuring your progress and improving
                continuously.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                GovPrep aims to make that process simple, focused and organized
                for every government job aspirant.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-3 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
              >
                Start Your Journey
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {/* VALUES LIST */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              {values.map((item, index) => (
                <div
                  key={item.title}
                  className={`flex gap-4 py-5 ${
                    index !== values.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                    ✓
                  </span>

                  <div>
                    <strong className="text-base font-bold text-slate-900">
                      {item.title}
                    </strong>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-emerald-600 to-teal-700 px-5 py-16 text-center text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Start Preparing?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-50">
            Choose your goal, build your preparation strategy and start
            working toward your government job.
          </p>

          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-3 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 no-underline shadow-sm transition hover:bg-emerald-50"
          >
            Get Started
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg">
                <FaGraduationCap />
              </span>

              <span className="text-xl font-bold">GovPrep</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/"
                className="text-sm text-slate-300 no-underline transition hover:text-emerald-300"
              >
                Home
              </Link>

              <Link
                to="/about"
                className="text-sm text-slate-300 no-underline transition hover:text-emerald-300"
              >
                About
              </Link>

              <Link
                to="/contact"
                className="text-sm text-slate-300 no-underline transition hover:text-emerald-300"
              >
                Contact
              </Link>

              <Link
                to="/login"
                className="text-sm text-slate-300 no-underline transition hover:text-emerald-300"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="mt-7 border-t border-slate-800 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © 2026 GovPrep. Built for government job aspirants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
