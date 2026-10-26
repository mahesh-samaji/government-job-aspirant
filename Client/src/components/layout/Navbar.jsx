import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaGraduationCap,
  FaHome,
  FaBriefcase,
  FaBookOpen,
  FaClipboardList,
  FaBell,
  FaRoute,
  FaUser,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true";

  const isPublicPage = ["/", "/about", "/contact"].includes(
    location.pathname
  );

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const publicLinks = [
    {
      name: "Home",
      path: "/",
      icon: <FaHome />,
    },
    {
      name: "About",
      path: "/about",
      icon: <FaUser />,
    },
    {
      name: "Contact",
      path: "/contact",
      icon: <FaClipboardList />,
    },
  ];

  const dashboardLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Jobs",
      path: "/jobs",
      icon: <FaBriefcase />,
    },
    {
      name: "Exams",
      path: "/exams",
      icon: <FaBookOpen />,
    },
    {
      name: "Study Plan",
      path: "/study-plan",
      icon: <FaClipboardList />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
    {
      name: "Roadmaps",
      path: "/roadmaps",
      icon: <FaRoute />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FaUser />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FaCog />,
    },
  ];

  const links = isAuthenticated ? dashboardLinks : publicLinks;

  return (
    <header
      className={
        isPublicPage
          ? "sticky top-0 z-50 border-b border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-sm"
          : "sticky top-0 z-50 border-b border-emerald-900 bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-900 shadow-lg"
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* LOGO */}

        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          onClick={closeMenu}
          className={
            isPublicPage
              ? "group flex shrink-0 items-center gap-3 text-slate-950"
              : "group flex shrink-0 items-center gap-3 text-white"
          }
        >
          <span
            className={
              isPublicPage
                ? "flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-lg text-white shadow-md shadow-emerald-500/20 transition duration-300 group-hover:scale-105"
                : "flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-lg text-white shadow-md transition duration-300 group-hover:scale-105"
            }
          >
            <FaGraduationCap />
          </span>

          <span className="text-xl font-extrabold tracking-tight">
            Gov
            <span
              className={
                isPublicPage ? "text-emerald-600" : "text-emerald-300"
              }
            >
              Prep
            </span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => {
                if (isPublicPage) {
                  return isActive
                    ? "flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 transition"
                    : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-emerald-700";
                }

                return isActive
                  ? "flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition"
                  : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300";
              }}
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-emerald-200 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-white hover:text-emerald-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-600 hover:to-teal-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className={
            isPublicPage
              ? "flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-white/60 text-slate-700 transition hover:bg-white hover:text-emerald-700 xl:hidden"
              : "flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/10 hover:text-emerald-300 xl:hidden"
          }
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}

      {isMenuOpen && (
        <div
          className={
            isPublicPage
              ? "border-t border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 px-5 py-4 shadow-lg xl:hidden"
              : "border-t border-emerald-800 bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-900 px-5 py-4 shadow-lg xl:hidden"
          }
        >
          {/* MOBILE LINKS */}

          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={({ isActive }) => {
                  if (isPublicPage) {
                    return isActive
                      ? "flex items-center gap-3 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700"
                      : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-emerald-700";
                  }

                  return isActive
                    ? "flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-300"
                    : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300";
                }}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* MOBILE ACTIONS */}

          <div
            className={
              isPublicPage
                ? "mt-4 border-t border-emerald-200 pt-4"
                : "mt-4 border-t border-white/10 pt-4"
            }
          >
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300/30 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-lg border border-emerald-200 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-white hover:text-emerald-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;