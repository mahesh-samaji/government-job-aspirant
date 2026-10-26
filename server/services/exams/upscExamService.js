const axios = require("axios");
const cheerio = require("cheerio");

const Exam = require("../../models/Exam");
const connectDB = require("../../config/db");

const UPSC_ACTIVE_EXAMS_URL =
  "https://www.upsc.gov.in/examinations/active-exams";

const UPSC_BASE_URL = "https://www.upsc.gov.in";

const cleanText = (text) => {
  return text.replace(/\s+/g, " ").trim();
};

/*
 * Convert UPSC date text such as:
 *
 * 22/09/2026
 *
 * into a JavaScript Date without shifting
 * the calendar date backward because of IST.
 *
 * We store the date at UTC midnight.
 */
const parseDate = (dateString) => {
  if (!dateString) {
    return null;
  }

  const match = dateString.match(
    /(\d{2})\/(\d{2})\/(\d{4})/
  );

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
  );
};

const createSourceId = (examName) => {
  return examName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const fetchExamDetails = async (
  examUrl,
  examName
) => {
  try {
    const response = await axios.get(
      examUrl,
      {
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0 Safari/537.36",
        },
      }
    );

    const $ = cheerio.load(response.data);

    let notificationDate = null;
    let examDate = null;
    let applicationEndDate = null;

    /*
     * The UPSC detail page contains the
     * actual date information in a table.
     */
    $("table tr").each(
      (index, row) => {
        const cells = $(row)
          .find("th, td")
          .map(
            (i, cell) =>
              cleanText($(cell).text())
          )
          .get();

        if (cells.length < 2) {
          return;
        }

        const label =
          cells[0].toLowerCase();

        const value = cells[1];

        if (
          label.includes(
            "date of notification"
          )
        ) {
          notificationDate =
            parseDate(value);
        }

        if (
          label.includes(
            "date of commencement of examination"
          )
        ) {
          examDate = parseDate(value);
        }

        if (
          label.includes(
            "last date for receipt of applications"
          )
        ) {
          applicationEndDate =
            parseDate(value);
        }
      }
    );

    /*
     * The exam name comes from the official
     * Active Examinations page.
     */
    if (!examName) {
      return null;
    }

    /*
     * We require an actual examination date.
     */
    if (!examDate) {
      return null;
    }

    const sourceId =
      createSourceId(examName);

    /*
     * Application status:
     *
     * If an application deadline exists and
     * that deadline has passed, the exam is
     * no longer active for applications.
     *
     * If there is no application deadline,
     * keep it active because UPSC still lists
     * the examination as active.
     */
    const now = new Date();

    let isActive = true;

    if (
      applicationEndDate &&
      applicationEndDate < now
    ) {
      isActive = false;
    }

    return {
      name: examName,

      organization:
        "Union Public Service Commission",

      category:
        "UPSC Examination",

      examDate,

      applicationStartDate:
        notificationDate,

      applicationEndDate,

      notificationDate,

      notificationUrl:
        examUrl,

      applyUrl:
        "https://upsconline.nic.in/",

      description:
        `${examName} conducted by the Union Public Service Commission.`,

      source: "UPSC",

      sourceId,

      isActive,
    };
  } catch (error) {
    console.error(
      `Failed to fetch UPSC exam details: ${examUrl}`
    );

    console.error(error.message);

    return null;
  }
};

const fetchUPSCExams = async () => {
  console.log(
    "\n========================================"
  );

  console.log(
    "UPSC EXAM COLLECTION STARTED"
  );

  console.log(
    "========================================"
  );

  try {
    /*
     * Open the official UPSC Active
     * Examinations page.
     */
    const response =
      await axios.get(
        UPSC_ACTIVE_EXAMS_URL,
        {
          timeout: 30000,

          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0 Safari/537.36",
          },
        }
      );

    const $ =
      cheerio.load(
        response.data
      );

    /*
     * Store both:
     *
     * exam URL
     * exam name
     *
     * The name comes directly from
     * the official Active Examinations
     * page.
     */
    const exams = new Map();

    $("a").each(
      (index, element) => {
        const href =
          $(element).attr("href");

        const text =
          cleanText(
            $(element).text()
          );

        if (!href || !text) {
          return;
        }

        /*
         * Only examination pages.
         */
        if (
          !href.includes(
            "/examinations/"
          )
        ) {
          return;
        }

        /*
         * Ignore the Active Examinations
         * page itself.
         */
        if (
          href.includes(
            "/active-exams"
          )
        ) {
          return;
        }

        /*
         * Ignore generic navigation links.
         */
        if (
          text.toLowerCase() ===
          "examination"
        ) {
          return;
        }

        if (
          text.toLowerCase() ===
          "calendar"
        ) {
          return;
        }

        const examUrl =
          href.startsWith("http")
            ? href
            : `${UPSC_BASE_URL}${href}`;

        exams.set(
          examUrl,
          text
        );
      }
    );

    console.log(
      `UPSC examination pages discovered: ${exams.size}`
    );

    if (exams.size === 0) {
      console.log(
        "No UPSC examination pages found."
      );

      return {
        success: false,
        discovered: 0,
        saved: 0,
        skipped: 0,
      };
    }

    /*
     * Get today's date.
     *
     * We only use this for determining
     * whether the actual examination has
     * already been completed.
     */
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    let savedCount = 0;
    let skippedCount = 0;

    /*
     * Process each official exam page.
     */
    for (
      const [
        examUrl,
        examName,
      ] of exams
    ) {
      console.log(
        `\nChecking: ${examName}`
      );

      const exam =
        await fetchExamDetails(
          examUrl,
          examName
        );

      /*
       * Invalid pages are skipped.
       */
      if (!exam) {
        skippedCount++;

        console.log(
          "Skipped: required exam details not found."
        );

        continue;
      }

      /*
       * Don't keep completed examinations.
       */
      if (
        exam.examDate &&
        exam.examDate < today
      ) {
        skippedCount++;

        console.log(
          `Skipping completed exam: ${exam.name}`
        );

        continue;
      }

      /*
       * Log expired application periods
       * but still save the exam record.
       *
       * This is useful because the examination
       * itself may still be upcoming even when
       * applications are closed.
       */
      if (
        exam.applicationEndDate &&
        exam.applicationEndDate <
          new Date()
      ) {
        console.log(
          `Application period closed: ${exam.name}`
        );
      } else {
        console.log(
          `Application period active: ${exam.name}`
        );
      }

      /*
       * Create or update the exam.
       */
      const savedExam =
        await Exam.findOneAndUpdate(
          {
            source:
              exam.source,

            sourceId:
              exam.sourceId,
          },

          exam,

          {
            upsert: true,
            returnDocument: "after",
          }
        );

      savedCount++;

      console.log(
        `Saved/updated UPSC exam: ${savedExam.name}`
      );

      console.log(
        `Active: ${savedExam.isActive}`
      );
    }

    console.log(
      "\n========================================"
    );

    console.log(
      "UPSC EXAM COLLECTION COMPLETE"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Discovered: ${exams.size}`
    );

    console.log(
      `Saved/updated: ${savedCount}`
    );

    console.log(
      `Skipped: ${skippedCount}`
    );

    return {
      success: true,

      discovered:
        exams.size,

      saved:
        savedCount,

      skipped:
        skippedCount,
    };
  } catch (error) {
    console.error(
      "UPSC exam collection failed:",
      error.message
    );

    throw error;
  }
};

if (
  require.main === module
) {
  connectDB()
    .then(
      () =>
        fetchUPSCExams()
    )
    .then(() => {
      console.log(
        "\nUPSC exam collection process finished."
      );

      process.exit(0);
    })
    .catch(
      (error) => {
        console.error(
          "\nUnexpected UPSC exam collection error:",
          error.message
        );

        process.exit(1);
      }
    );
}

module.exports =
  fetchUPSCExams;