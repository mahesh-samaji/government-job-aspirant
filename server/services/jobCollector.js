const connectDB = require("../config/db");
const Job = require("../models/Job");

const fetchUPSCJobs = require("./upscService");

const { importSscJobs } = require("./sscService");

const {
  collectAllRRBJobs,
} = require("./rrb/rrbCollector");

const fetchTGPSCJobs = require("./telangana/tgpscService");

const fetchTelanganaPoliceJobs =
  require("./telangana/policeService");

const fetchTelanganaDefenceJobs =
  require("./defence/telanganaDefenceService");

const {
  createJobNotifications,
} = require("./notificationService");

const runJobCollection = async () => {
  console.log("\n========================================");
  console.log("GOVPREP JOB COLLECTION STARTED");
  console.log("========================================");

  const results = {
    upsc: null,
    ssc: null,
    rrb: null,
    tgpsc: null,
    telanganaPolice: null,
    telanganaDefence: null,
  };

  try {
    console.log("\nConnecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connection ready.");
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    return results;
  }

  /*
   * --------------------------------------------------
   * SNAPSHOT EXISTING JOBS
   * --------------------------------------------------
   *
   * We store the IDs of jobs that already exist before
   * this collection run starts.
   *
   * Later, after all collectors finish, we compare the
   * database again.
   *
   * This allows us to identify only genuinely NEW jobs.
   */
  console.log("\nChecking existing jobs...");

  let existingJobIds = new Set();

  try {
    const existingJobs = await Job.find({})
      .select("_id")
      .lean();

    existingJobIds = new Set(
      existingJobs.map((job) => job._id.toString())
    );

    console.log(
      `Existing jobs before collection: ${existingJobIds.size}`
    );
  } catch (error) {
    console.error(
      "Failed to check existing jobs:",
      error.message
    );

    return results;
  }

  /*
   * --------------------------------------------------
   * UPSC
   * --------------------------------------------------
   */
  console.log("\nStarting UPSC collection...");

  try {
    results.upsc = await fetchUPSCJobs();

    console.log("UPSC collection completed.");
  } catch (error) {
    console.error(
      "UPSC collection failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * SSC
   * --------------------------------------------------
   */
  console.log("\nStarting SSC collection...");

  try {
    results.ssc = await importSscJobs();

    console.log("SSC collection completed.");
  } catch (error) {
    console.error(
      "SSC collection failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * RRB
   * --------------------------------------------------
   */
  console.log("\nStarting RRB collection...");

  try {
    results.rrb = await collectAllRRBJobs();

    console.log("RRB collection completed.");
  } catch (error) {
    console.error(
      "RRB collection failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * TGPSC
   * --------------------------------------------------
   */
  console.log("\nStarting TGPSC collection...");

  try {
    results.tgpsc = await fetchTGPSCJobs();

    console.log("TGPSC collection completed.");
  } catch (error) {
    console.error(
      "TGPSC collection failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * TELANGANA POLICE
   * --------------------------------------------------
   */
  console.log(
    "\nStarting Telangana Police collection..."
  );

  try {
    results.telanganaPolice =
      await fetchTelanganaPoliceJobs();

    console.log(
      "Telangana Police collection completed."
    );
  } catch (error) {
    console.error(
      "Telangana Police collection failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * TELANGANA DEFENCE
   * --------------------------------------------------
   */
  console.log(
    "\nStarting Telangana Defence collection..."
  );

  try {
    results.telanganaDefence =
      await fetchTelanganaDefenceJobs();

    console.log(
      "Telangana Defence collection completed."
    );
  } catch (error) {
    console.error(
      "Telangana Defence collection failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * DEACTIVATE EXPIRED / NOT-YET-OPEN JOBS
   * --------------------------------------------------
   *
   * This is a final safety check after all collectors
   * have completed.
   *
   * Expired jobs are marked inactive.
   *
   * Jobs whose application period has not started yet
   * are also kept inactive.
   *
   * This protects all job sources from accidentally
   * leaving an expired or future job active.
   */
  console.log(
    "\nChecking job application periods..."
  );

  try {
    const now = new Date();

    const dateCheckResult = await Job.updateMany(
      {
        isActive: true,
        $or: [
          {
            applicationEndDate: {
              $lt: now,
            },
          },
          {
            applicationStartDate: {
              $gt: now,
            },
          },
        ],
      },
      {
        $set: {
          isActive: false,
        },
      }
    );

    console.log(
      `Jobs deactivated by application-date check: ${dateCheckResult.modifiedCount}`
    );
  } catch (error) {
    console.error(
      "Application-date check failed:",
      error.message
    );
  }

  /*
   * --------------------------------------------------
   * FIND ONLY NEW JOBS
   * --------------------------------------------------
   *
   * At this point all source collectors have finished
   * and application-date validation has also completed.
   *
   * We now read the database again and compare the
   * current active jobs with the snapshot taken before
   * collection started.
   *
   * A job is considered NEW when its MongoDB _id did
   * not exist before this collection run.
   */
  console.log("\nChecking for newly added jobs...");

  try {
    const currentJobs = await Job.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    const newJobs = currentJobs.filter(
      (job) =>
        !existingJobIds.has(job._id.toString())
    );

    console.log(
      `Active jobs after collection: ${currentJobs.length}`
    );

    console.log(
      `New jobs found in this collection: ${newJobs.length}`
    );

    /*
     * --------------------------------------------------
     * CREATE NOTIFICATIONS ONLY FOR NEW JOBS
     * --------------------------------------------------
     */
    if (newJobs.length === 0) {
      console.log(
        "No new jobs found. No job notifications created."
      );
    } else {
      console.log(
        "\nCreating notifications for new jobs..."
      );

      let notificationCount = 0;

      for (const job of newJobs) {
        const notificationResult =
          await createJobNotifications(job);

        if (notificationResult.success) {
          notificationCount +=
            notificationResult.created;
        }
      }

      console.log(
        `Job notification processing completed. Created: ${notificationCount}`
      );
    }
  } catch (error) {
    console.error(
      "Job notification processing failed:",
      error.message
    );
  }

  console.log("\n========================================");
  console.log("GOVPREP JOB COLLECTION COMPLETE");
  console.log("========================================");

  console.log(
    JSON.stringify(results, null, 2)
  );

  return results;
};

if (require.main === module) {
  runJobCollection()
    .then(() => {
      console.log(
        "\nJob collection process finished."
      );
    })
    .catch((error) => {
      console.error(
        "\nUnexpected job collection error:",
        error.message
      );

      process.exitCode = 1;
    });
}

module.exports = {
  runJobCollection,
};