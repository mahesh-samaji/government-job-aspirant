import React from "react";

const ExamFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  conductingBody,
  setConductingBody,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* SEARCH */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Exams
            </label>

            <input
              type="text"
              placeholder="Search exam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Categories</option>
              <option value="Banking">Banking</option>
              <option value="Railway">Railway</option>
              <option value="SSC">SSC</option>
              <option value="UPSC">UPSC</option>
              <option value="Defence">Defence</option>
              <option value="State Government">State Government</option>
            </select>
          </div>

          {/* CONDUCTING BODY */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Conducting Body
            </label>

            <select
              value={conductingBody}
              onChange={(e) => setConductingBody(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Organizations</option>
              <option value="SSC">SSC</option>
              <option value="UPSC">UPSC</option>
              <option value="IBPS">IBPS</option>
              <option value="SBI">SBI</option>
              <option value="RRB">RRB</option>
              <option value="State PSC">State PSC</option>
            </select>
          </div>
        </div>

        {/* RESET */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamFilters;