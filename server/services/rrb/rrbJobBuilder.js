const buildRRBJob = ({
  cenNumber,
  title,
  organization,
  applicationStartDate,
  applicationEndDate,
  notificationUrl,
  source,
  sourceId,
  description = "",
  vacancies = null,
  qualification = [],
  location = "India",
  salary = "",
  ageLimit = "",
}) => {
  return {
    title: title || `Railway Recruitment - CEN ${cenNumber}`,

    organization:
      organization || "Railway Recruitment Board",

    category: "Railway / RRB",

    vacancies,

    qualification,

    location,

    notificationDate: new Date(),

    applicationStartDate,

    applicationEndDate,

    examDate: null,

    notificationUrl: notificationUrl || "",

    applyUrl: notificationUrl || "",

    source: source || "RRB",

    sourceId: sourceId || `RRB-${cenNumber}`,

    description,

    salary,

    ageLimit,

    isActive: true,
  };
};


module.exports = {
  buildRRBJob,
};