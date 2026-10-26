const cron = require("node-cron");

const { runExamCollection } = require("./examCollector");

let isExamCollectionRunning = false;

const startExamScheduler = () => {
  console.log("Exam scheduler started.");

  cron.schedule(
    "30 2 * * *",
    async () => {
      if (isExamCollectionRunning) {
        console.log(
          "Exam collection is already running. Skipping this scheduled run."
        );

        return;
      }

      try {
        isExamCollectionRunning = true;

        console.log("\n========================================");
        console.log("SCHEDULED EXAM COLLECTION STARTED");
        console.log("========================================");

        await runExamCollection();

        console.log("\nScheduled exam collection completed.");
      } catch (error) {
        console.error(
          "Scheduled exam collection failed:",
          error.message
        );
      } finally {
        isExamCollectionRunning = false;
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "Next automatic exam collection: Every day at 2:30 AM IST."
  );
};

module.exports = {
  startExamScheduler,
};