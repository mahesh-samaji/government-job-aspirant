import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight, FaHome } from "react-icons/fa";

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* TITLE SECTION */}
        <div className="min-w-0">
          {breadcrumbs.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-medium text-slate-500 transition hover:text-blue-600"
              >
                <FaHome className="text-xs" />
                <span>Dashboard</span>
              </Link>

              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`${breadcrumb.label}-${index}`}>
                  <FaChevronRight className="text-[10px] text-slate-400" />

                  {breadcrumb.path ? (
                    <Link
                      to={breadcrumb.path}
                      className="font-medium text-slate-500 transition hover:text-blue-600"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-700">
                      {breadcrumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;