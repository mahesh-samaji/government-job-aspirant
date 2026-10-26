import React from "react";
import {
  FaSearch,
  FaFilter,
  FaUndo,
} from "react-icons/fa";

const JobFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  qualification,
  setQualification,
  location,
  setLocation,
  onReset,
}) => {
  return (
    <div>
      {/* FILTER HEADER */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FaFilter className="text-sm" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Refine your search
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Filter opportunities based on your preferences
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition duration-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <FaUndo className="text-[10px]" />
          Reset Filters
        </button>
      </div>

      {/* FILTER GRID */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* SEARCH */}
        <div>
          <label
            htmlFor="job-search"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            Search Jobs
          </label>

          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

            <input
              id="job-search"
              type="text"
              placeholder="Job or organization"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-3.5 text-sm font-medium text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-emerald-200 hover:bg-white focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* CATEGORY */}
        <div>
          <label
            htmlFor="job-category"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            Category
          </label>

          <select
            id="job-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition duration-200 hover:border-emerald-200 hover:bg-white focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="">All Categories</option>
            <option value="Banking">Banking</option>
            <option value="Railway">Railway</option>
            <option value="SSC">SSC</option>
            <option value="UPSC">UPSC</option>
            <option value="Defence">Defence</option>
            <option value="State Government">
              State Government
            </option>
          </select>
        </div>

        {/* QUALIFICATION */}
        <div>
          <label
            htmlFor="job-qualification"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            Qualification
          </label>

          <select
            id="job-qualification"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition duration-200 hover:border-emerald-200 hover:bg-white focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="">All Qualifications</option>
            <option value="10th">10th Pass</option>
            <option value="12th">12th Pass</option>
            <option value="Diploma">Diploma</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">
              Post Graduate
            </option>
          </select>
        </div>

        {/* LOCATION */}
        <div>
          <label
            htmlFor="job-location"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            Location
          </label>

          <select
            id="job-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition duration-200 hover:border-emerald-200 hover:bg-white focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="">All Locations</option>
            <option value="All India">All India</option>
            <option value="Telangana">Telangana</option>
            <option value="Andhra Pradesh">
              Andhra Pradesh
            </option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;