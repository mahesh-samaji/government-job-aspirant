import React from "react";
import ExamCard from "./ExamCard";

const ExamList = ({ exams = [] }) => {
  if (exams.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-55 flex-col items-center justify-center px-6 py-10 text-center">
          <h3 className="text-lg font-bold text-slate-900">
            No Exams Found
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            No government exams match your current search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          id={exam.id}
          name={exam.name}
          conductingBody={exam.conductingBody}
          examDate={exam.examDate}
          applicationLastDate={exam.applicationLastDate}
          category={exam.category}
        />
      ))}
    </div>
  );
};

export default ExamList;