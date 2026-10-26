import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationList = ({
  notifications = [],
  onNotificationClick,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-55 flex-col items-center justify-center px-6 py-10 text-center">
          <h3 className="text-lg font-bold text-slate-900">
            No Notifications
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            You are all caught up. New government job and exam updates
            will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h3 className="text-lg font-bold text-slate-900">
          Notifications
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Stay updated with important job and exam alerts.
        </p>
      </div>

      {/* LIST */}
      <div>
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id || index}
            title={notification.title}
            message={notification.message}
            date={notification.date}
            type={notification.type}
            isRead={notification.isRead}
            onClick={() => onNotificationClick?.(notification)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;