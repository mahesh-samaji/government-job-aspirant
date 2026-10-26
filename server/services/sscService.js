const connectDB = require("../config/db");
const Job = require("../models/Job");

const {
  downloadPdf,
  extractPdfText,
  parseSscPosts,
} = require("./sscPdfParser");

const SSC_PDF_URL =
  "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_RHQ_2026_phase_xiv.pdf";

const SSC_CATEGORY = "SSC Selection Post Phase XIV 2026";

const APPLICATION_START_DATE = new Date("2026-04-13T00:00:00.000Z");
const APPLICATION_END_DATE = new Date("2026-05-04T23:59:59.999Z");

const importSscJobs = async () => {
  try {
    console.log("\n========================================");
    console.log("STARTING SSC JOB IMPORT");
    console.log("========================================");

    // ----------------------------------------
    // DOWNLOAD SSC PDF
    // ----------------------------------------
    await downloadPdf();

    // ----------------------------------------
    // EXTRACT PDF TEXT
    // ----------------------------------------
    const text = await extractPdfText();

    // ----------------------------------------
    // PARSE SSC POSTS
    // ----------------------------------------
    const { posts, failedRows } = parseSscPosts(text);

    console.log("\nSSC posts parsed:", posts.length);
    console.log("SSC failed rows:", failedRows.length);

    if (failedRows.length > 0) {
      throw new Error(
        `SSC import stopped because ${failedRows.length} rows failed to parse.`
      );
    }

    // ----------------------------------------
    // CHECK CURRENT DATE
    // ----------------------------------------
    const now = new Date();

    const isApplicationActive =
      now >= APPLICATION_START_DATE &&
      now <= APPLICATION_END_DATE;

    console.log("\nCurrent date:", now.toISOString());
    console.log(
      "Application period:",
      APPLICATION_START_DATE.toISOString(),
      "to",
      APPLICATION_END_DATE.toISOString()
    );
    console.log(
      "SSC Selection Post applications active:",
      isApplicationActive
    );

    // ----------------------------------------
    // DEACTIVATE PREVIOUS SELECTION POST RECORDS
    // ----------------------------------------
    // This prevents old records from remaining
    // active after their application deadline.
    await Job.updateMany(
      {
        source: "SSC",
        category: SSC_CATEGORY,
      },
      {
        $set: {
          isActive: false,
        },
      }
    );

    console.log("Previous SSC Selection Post records deactivated.");

    // ----------------------------------------
    // PREPARE BULK OPERATIONS
    // ----------------------------------------
    const operations = posts.map((post) => {
      const jobData = {
        title: post.title,

        organization: post.organization,

        category: SSC_CATEGORY,

        vacancies: post.vacancies.total,

        qualification: post.examLevel
          ? [post.examLevel]
          : [],

        location: `${post.region} Region`,

        notificationDate: new Date("2026-04-13"),

        applicationStartDate: APPLICATION_START_DATE,

        applicationEndDate: APPLICATION_END_DATE,

        examDate: null,

        notificationUrl: SSC_PDF_URL,

        applyUrl: "https://ssc.gov.in/",

        source: "SSC",

        sourceId: post.postCode,

        description:
          `SSC Selection Post Phase XIV 2026. ` +
          `Post Code: ${post.postCode}. ` +
          `Region: ${post.region}. ` +
          `Vacancy distribution - SC: ${post.vacancies.sc}, ` +
          `ST: ${post.vacancies.st}, ` +
          `OBC: ${post.vacancies.obc}, ` +
          `UR: ${post.vacancies.ur}, ` +
          `EWS: ${post.vacancies.ews}.`,

        salary: post.salary,

        ageLimit: post.ageLimit,

        // IMPORTANT:
        // Automatically becomes false after the
        // application deadline.
        isActive: isApplicationActive,
      };

      return {
        updateOne: {
          filter: {
            source: "SSC",
            sourceId: post.postCode,
          },

          update: {
            $set: jobData,
          },

          upsert: true,
        },
      };
    });

    console.log("\nPrepared bulk operations:", operations.length);

    // ----------------------------------------
    // BULK WRITE
    // ----------------------------------------
    const result = await Job.bulkWrite(operations, {
      ordered: false,
    });

    // ----------------------------------------
    // RESULTS
    // ----------------------------------------
    const inserted = result.upsertedCount || 0;

    const updated = result.modifiedCount || 0;

    console.log("\n========================================");
    console.log("SSC JOB IMPORT COMPLETED");
    console.log("========================================");

    console.log("Total parsed:", posts.length);
    console.log("Inserted:", inserted);
    console.log("Updated:", updated);
    console.log("Active:", isApplicationActive ? posts.length : 0);
    console.log("Inactive:", isApplicationActive ? 0 : posts.length);

    return {
      total: posts.length,
      inserted,
      updated,
      active: isApplicationActive ? posts.length : 0,
      inactive: isApplicationActive ? 0 : posts.length,
    };
  } catch (error) {
    console.error("\nSSC job import failed:");
    console.error(error.message);

    throw error;
  }
};

module.exports = {
  importSscJobs,
};

if (require.main === module) {
  (async () => {
    await connectDB();

    await importSscJobs();

    process.exit(0);
  })();
}