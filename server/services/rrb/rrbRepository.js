const Job = require("../../models/Job");


// --------------------------------------------------
// SAVE / UPDATE OPEN RRB JOB
// --------------------------------------------------

const saveRRBJobIfOpen = async (job) => {
  if (!job) {
    throw new Error("Job data is required.");
  }

  if (!job.source) {
    throw new Error("Job source is required.");
  }

  if (!job.sourceId) {
    throw new Error("Job sourceId is required.");
  }

  const existingJob = await Job.findOne({
    source: job.source,
    sourceId: job.sourceId,
  });

  if (existingJob) {
    Object.assign(existingJob, job);

    await existingJob.save();

    return {
      action: "updated",
      job: existingJob,
    };
  }

  const createdJob = await Job.create(job);

  return {
    action: "inserted",
    job: createdJob,
  };
};


// --------------------------------------------------
// DEACTIVATE CLOSED RRB JOB
// --------------------------------------------------

const deactivateRRBJob = async ({
  source,
  sourceId,
  applicationEndDate,
}) => {
  if (!source) {
    throw new Error("Job source is required.");
  }

  if (!sourceId) {
    throw new Error("Job sourceId is required.");
  }

  const existingJob = await Job.findOne({
    source,
    sourceId,
  });

  if (!existingJob) {
    return {
      action: "not-found",
      job: null,
    };
  }

  existingJob.isActive = false;

  if (applicationEndDate) {
    existingJob.applicationEndDate = applicationEndDate;
  }

  await existingJob.save();

  return {
    action: "deactivated",
    job: existingJob,
  };
};


module.exports = {
  saveRRBJobIfOpen,
  deactivateRRBJob,
};