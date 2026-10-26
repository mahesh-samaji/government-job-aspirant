import React from "react";
import JobCard from "./JobCard";

const JobList = ({ jobs = [] }) => {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-55 flex-col items-center justify-center px-6 py-10 text-center">
          <h3 className="text-lg font-bold text-slate-900">No Jobs Found</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            No government jobs match your current search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          id={job.id}
          title={job.title}
          organization={job.organization}
          location={job.location}
          lastDate={job.lastDate}
          qualification={job.qualification}
          jobType={job.jobType}
        />
      ))}
    </div>
  );
};

export default JobList;