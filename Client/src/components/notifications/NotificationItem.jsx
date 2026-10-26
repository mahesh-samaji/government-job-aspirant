import React from "react";
import {
  FaBell,
  FaBriefcase,
  FaCalendarAlt,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const NotificationItem = ({
  title,
  message,
  date,
  type = "general",
  isRead = false,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case "job":
        return <FaBriefcase />;

      case "exam":
        return <FaFileAlt />;

      case "deadline":
        return <FaCalendarAlt />;

      case "success":
        return <FaCheckCircle />;

      case "warning":
        return <FaExclamationCircle />;

      default:
        return <FaBell />;
    }
  };

  const iconStyles = {
    job: "bg-blue-50 text-blue-600",
    exam: "bg-purple-50 text-purple-600",
    deadline: "bg-amber-50 text-amber-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-red-50 text-red-600",
    general: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className={`relative flex gap-4 border-b border-slate-200 px-5 py-4 transition last:border-b-0 ${
        onClick
          ? "cursor-pointer hover:bg-slate-50"
          : ""
      } ${
        !isRead ? "bg-blue-50/30" : "bg-white"
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* ICON */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base ${
          iconStyles[type] || iconStyles.general
        }`}
      >
        {getIcon()}
      </div>

      {/* CONTENT */}
      <div className="min-w-0 flex-1 pr-4">
        <h4
          className={`text-sm leading-5 ${
            isRead
              ? "font-medium text-slate-700"
              : "font-bold text-slate-900"
          }`}
        >
          {title}
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {message}
        </p>

        {date && (
          <span className="mt-2 block text-xs font-medium text-slate-400">
            {date}
          </span>
        )}
      </div>

      {/* UNREAD DOT */}
      {!isRead && (
        <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-blue-600"></span>
      )}
    </div>
  );
};

export default NotificationItem;