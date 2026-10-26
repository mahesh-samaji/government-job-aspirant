const {
  extractApplicationDates,
  extractCenNumber,
  extractJobTitle,
} = require("./rrbParser");

const {
  parseDate,
  isApplicationOpen,
} = require("./rrbDateValidator");

const {
  buildRRBJob,
} = require("./rrbJobBuilder");

const {
  saveRRBJobIfOpen,
  deactivateRRBJob,
} = require("./rrbRepository");

const processRRBDocument = async ({
  pdfText,
  notificationUrl,
  source = "RRB",
  organization = "Railway Recruitment Board",
}) => {
  if (!pdfText) {
    throw new Error("RRB PDF text is required.");
  }

  const cenNumber = extractCenNumber(pdfText);

  if (!cenNumber) {
    throw new Error("CEN number could not be found.");
  }

  const {
    applicationStartDate,
    applicationEndDate,
  } = extractApplicationDates(pdfText);

  if (!applicationStartDate || !applicationEndDate) {
    throw new Error(
      `Application dates could not be found for CEN ${cenNumber}.`
    );
  }

  const parsedStartDate = parseDate(applicationStartDate);
  const parsedEndDate = parseDate(applicationEndDate);

  if (!parsedStartDate || !parsedEndDate) {
    throw new Error(
      `Invalid application dates for CEN ${cenNumber}.`
    );
  }

  /*
   * If the application period has ended,
   * deactivate the existing database record.
   */

  if (!isApplicationOpen(parsedStartDate, parsedEndDate)) {
    const sourceId = `${source}-${cenNumber}`;

    const result = await deactivateRRBJob({
      source,
      sourceId,
      applicationEndDate: parsedEndDate,
    });

    return {
      status: result.action === "deactivated"
        ? "deactivated"
        : "skipped",
      reason: "Application period has ended.",
      cenNumber,
      applicationStartDate: parsedStartDate,
      applicationEndDate: parsedEndDate,
      job: result.job,
    };
  }

  const title = extractJobTitle(pdfText);

  const job = buildRRBJob({
    cenNumber,

    title,

    organization,

    applicationStartDate: parsedStartDate,

    applicationEndDate: parsedEndDate,

    notificationUrl,

    source,

    sourceId: `${source}-${cenNumber}`,

    description: `Official Railway Recruitment Board recruitment notification for CEN ${cenNumber}.`,
  });

  const result = await saveRRBJobIfOpen(job);

  return {
    status: result.action,
    cenNumber,
    job: result.job,
  };
};

module.exports = {
  processRRBDocument,
};