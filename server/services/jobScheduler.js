const cron = require("node-cron");

const { runJobCollection } = require("./jobCollector");

let isCollectionRunning = false;

const startJobScheduler = () => {
  console.log("Job scheduler started.");

  cron.schedule(
    "0 2 * * *",
    async () => {
      if (isCollectionRunning) {
        console.log(
          "Job collection is already running. Skipping this scheduled run."
        );

        return;
      }

      try {
        isCollectionRunning = true;

        console.log("\n========================================");
        console.log("SCHEDULED JOB COLLECTION STARTED");
        console.log("========================================");

        await runJobCollection();

        console.log("\nScheduled job collection completed.");
      } catch (error) {
        console.error(
          "Scheduled job collection failed:",
          error.message
        );
      } finally {
        isCollectionRunning = false;
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "Next automatic job collection: Every day at 2:00 AM IST."
  );
};

module.exports = {
  startJobScheduler,
};