import React from "react";
import { FaSearch } from "react-icons/fa";

const JobSearch = ({ search, setSearch }) => {
  return (
    <div className="relative w-full">
      <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

      <input
        type="text"
        className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        placeholder="Search government jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default JobSearch;