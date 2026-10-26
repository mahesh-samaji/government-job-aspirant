const connectDB = require("../config/db");

const fetchUPSCExams = require("./exams/upscExamService");
const fetchSSCExams = require("./exams/sscExamService");

const runExamCollection = async () => {
  console.log("\n========================================");
  console.log("CENTRAL EXAM COLLECTION STARTED");
  console.log("========================================");

  try {
    await connectDB();

    // ========================================
    // UPSC
    // ========================================

    console.log("\nStarting UPSC exam collection...");

    const upscResult = await fetchUPSCExams();

    console.log("\nUPSC exam collection result:");
    console.log(upscResult);

    // ========================================
    // SSC
    // ========================================

    console.log("\nStarting SSC exam collection...");

    const sscResult = await fetchSSCExams();

    console.log("\nSSC exam collection result:");
    console.log(sscResult);

    // ========================================
    // COMPLETE
    // ========================================

    console.log("\n========================================");
    console.log("CENTRAL EXAM COLLECTION COMPLETE");
    console.log("========================================");

    return {
      success: true,

      sources: {
        UPSC: upscResult,
        SSC: sscResult,
      },
    };
  } catch (error) {
    console.error(
      "\nCentral exam collection failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  runExamCollection,
};