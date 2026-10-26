const { collectRRBChennai } = require("./collectors/rrbChennaiCollector");
const { collectRRBSecunderabad } = require("./collectors/rrbSecunderabadCollector");

const collectAllRRBJobs = async () => {
  console.log("\n========================================");
  console.log("RRB MASTER COLLECTOR");
  console.log("========================================");

  const results = {
    chennai: [],
    secunderabad: [],
  };

  console.log("\nStarting RRB Chennai collection...");

  try {
    results.chennai = await collectRRBChennai();

    console.log("\nRRB Chennai collection finished successfully.");
  } catch (error) {
    console.error(
      "\nRRB Chennai collection failed:",
      error.message
    );
  }

  console.log("\nStarting RRB Secunderabad collection...");

  try {
    results.secunderabad = await collectRRBSecunderabad();

    console.log(
      "\nRRB Secunderabad collection finished successfully."
    );
  } catch (error) {
    console.error(
      "\nRRB Secunderabad collection failed:",
      error.message
    );
  }

  console.log("\n========================================");
  console.log("RRB MASTER COLLECTION COMPLETE");
  console.log("========================================");

  console.log(
    JSON.stringify(results, null, 2)
  );

  return results;
};

module.exports = {
  collectAllRRBJobs,
};

/*
 * Run collector when this file is executed directly.
 */
if (require.main === module) {
  collectAllRRBJobs()
    .then(() => {
      console.log("\nRRB collector finished.");
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        "\nRRB collector failed:",
        error
      );

      process.exit(1);
    });
}