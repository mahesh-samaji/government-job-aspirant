import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Government Jobs",
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
  ];

  const accountItems = [
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

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const renderMenuItem = (item) => {
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
            isActive
              ? "bg-white/10 text-emerald-300 shadow-sm"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Active Indicator */}
            {isActive && (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400" />
            )}

            {/* Icon */}
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-400 group-hover:bg-white/5 group-hover:text-emerald-300"
              }`}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span className="truncate">{item.name}</span>

            {/* Active Dot */}
            {isActive && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-emerald-800/60 bg-linear-to-b from-emerald-950 via-emerald-900 to-teal-950 lg:flex">
      {/* Background Glow */}
      <div className="pointer-events-none absolute right-0 top-20 h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl" />

      {/* Logo */}
      <div className="relative border-b border-white/10 px-5 py-5">
        <NavLink
          to="/dashboard"
          className="group flex items-center gap-3"
        >
          {/* Logo Icon */}
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-lg text-white shadow-lg shadow-emerald-950/30 transition duration-300 group-hover:scale-105">
            <FaGraduationCap />
          </span>

          {/* Logo Text */}
          <div className="min-w-0">
            <strong className="block text-lg font-extrabold tracking-tight text-white">
              Gov<span className="text-emerald-300">Prep</span>
            </strong>

            <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
              Preparation Platform
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 px-4 py-6">
        {/* Main Menu */}
        <div>
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400/70">
            Main Menu
          </p>

          <nav className="space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>

        {/* Account */}
        <div className="mt-8">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400/70">
            Account
          </p>

          <nav className="space-y-1">
            {accountItems.map(renderMenuItem)}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative border-t border-white/10 p-4">
        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-200"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-red-400 transition group-hover:bg-red-500/10">
            <FaSignOutAlt />
          </span>

          <span>Logout</span>
        </button>

        {/* Footer Card */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <p className="text-xs font-bold text-white">
              GovPrep
            </p>
          </div>

          <p className="mt-1.5 text-[10px] font-medium text-slate-400">
            Prepare • Track • Achieve
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;