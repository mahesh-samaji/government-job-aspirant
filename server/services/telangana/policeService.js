const { chromium } = require("playwright");
const { PDFParse } = require("pdf-parse");

const Job = require("../../models/Job");
const connectDB = require("../../config/db");

const TGPRB_URL = "https://www.tgprb.in/";

/*
|--------------------------------------------------------------------------
| Recruitment configuration
|--------------------------------------------------------------------------
*/

const RECRUITMENTS = {
  PC: {
    sourceId: "TGPRB-PC-CIVIL-2026",
    title: "SCT Police Constable (Civil and equivalent posts)",
    vacancies: 7112,
    salary: "Rs. 24,280 - 72,850",
    notificationDate: new Date(2026, 6, 29),
  },

  SI: {
    sourceId: "TGPRB-SI-CIVIL-2026",
    title: "SCT Sub Inspector (Civil and equivalent posts)",
    vacancies: 275,
    salary: "Rs. 42,300 - 1,15,270",
    notificationDate: new Date(2026, 6, 29),
  },

  DRIVER_MECHANIC: {
    sourceId: "TGPRB-PC-DRIVER-MECHANIC-2026",
    title: "SCT Police Constable Driver / Mechanic",
    vacancies: 27,
    salary: "Rs. 24,280 - 72,850",
    notificationDate: new Date(2026, 6, 29),
  },

  ASI_FPB: {
    sourceId: "TGPRB-ASI-FPB-2026",
    title: "SCT Assistant Sub Inspector (Finger Print Bureau)",
    vacancies: 23,
    salary: "Rs. 33,750 - 99,310",
    notificationDate: new Date(2026, 6, 29),
  },
};

/*
|--------------------------------------------------------------------------
| Convert numeric date
|--------------------------------------------------------------------------
*/

const convertDate = (dateString) => {
  if (!dateString) {
    return null;
  }

  const match = dateString.match(
    /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/
  );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  return new Date(year, month - 1, day);
};

/*
|--------------------------------------------------------------------------
| Convert written month date
|--------------------------------------------------------------------------
*/

const monthNameToDate = (
  day,
  monthName,
  year
) => {
  const months = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const month =
    months[monthName.toLowerCase()];

  if (month === undefined) {
    return null;
  }

  return new Date(
    Number(year),
    month,
    Number(day)
  );
};

/*
|--------------------------------------------------------------------------
| Check whether application is currently open
|--------------------------------------------------------------------------
*/

const isApplicationOpen = (
  startDate,
  endDate
) => {
  if (!startDate || !endDate) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return (
    today >= start &&
    today <= end
  );
};

/*
|--------------------------------------------------------------------------
| Download PDF
|--------------------------------------------------------------------------
*/

const downloadPdf = async (
  context,
  url
) => {
  const response =
    await context.request.get(url, {
      timeout: 60000,

      headers: {
        Referer: TGPRB_URL,
      },
    });

  if (!response.ok()) {
    throw new Error(
      `PDF request failed: ${response.status()} ${response.statusText()}`
    );
  }

  const contentType =
    response.headers()["content-type"] || "";

  if (
    !contentType
      .toLowerCase()
      .includes("pdf") &&
    !url.toLowerCase().includes(".pdf")
  ) {
    throw new Error(
      `Expected PDF but received ${contentType}`
    );
  }

  return await response.body();
};

/*
|--------------------------------------------------------------------------
| Extract PDF text
|--------------------------------------------------------------------------
*/

const extractPdfText = async (
  pdfBuffer
) => {
  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result =
      await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
};

/*
|--------------------------------------------------------------------------
| Normalize PDF text
|--------------------------------------------------------------------------
*/

const normalizeText = (
  text
) => {
  return text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/*
|--------------------------------------------------------------------------
| Identify recruitment from URL
|--------------------------------------------------------------------------
*/

const identifyRecruitment = (
  url
) => {
  const value =
    url.toLowerCase();

  if (
    value.includes("pc+(civil") ||
    value.includes("pc%2b(civil")
  ) {
    return RECRUITMENTS.PC;
  }

  if (
    value.includes("si+(civil") ||
    value.includes("si%2b(civil")
  ) {
    return RECRUITMENTS.SI;
  }

  if (
    value.includes("driver") &&
    value.includes("mechanic")
  ) {
    return RECRUITMENTS.DRIVER_MECHANIC;
  }

  if (
    value.includes("asi+(fpb") ||
    value.includes("asi%2b(fpb")
  ) {
    return RECRUITMENTS.ASI_FPB;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Discover official recruitment notification links
|--------------------------------------------------------------------------
*/

const discoverNotificationLinks =
  async (page) => {
    console.log(
      "\nDiscovering TGPRB notification links..."
    );

    const links =
      await page.locator("a")
        .evaluateAll(
          (anchors) =>
            anchors.map(
              (anchor) => ({
                text:
                  anchor.innerText.trim(),
                href:
                  anchor.href,
              })
            )
        );

    const notifications = [];

    for (const link of links) {
      if (!link.href) {
        continue;
      }

      const recruitment =
        identifyRecruitment(
          link.href
        );

      if (!recruitment) {
        continue;
      }

      const text =
        link.text.toLowerCase();

      if (
        text.includes("notification") &&
        !text.includes("supplementary") &&
        !text.includes("category")
      ) {
        notifications.push({
          ...link,
          recruitment,
        });
      }
    }

    /*
     * Remove duplicate recruitment entries.
     */

    const unique = [];
    const seen = new Set();

    for (
      const item of notifications
    ) {
      if (
        seen.has(
          item.recruitment.sourceId
        )
      ) {
        continue;
      }

      seen.add(
        item.recruitment.sourceId
      );

      unique.push(item);
    }

    return unique;
  };

/*
|--------------------------------------------------------------------------
| Discover press release links
|--------------------------------------------------------------------------
*/

const discoverPressReleaseLinks =
  async (page) => {
    console.log(
      "\nDiscovering TGPRB press release links..."
    );

    const links =
      await page.locator("a")
        .evaluateAll(
          (anchors) =>
            anchors.map(
              (anchor) => ({
                text:
                  anchor.innerText.trim(),
                href:
                  anchor.href,
              })
            )
        );

    const results = [];

    for (const link of links) {
      if (!link.href) {
        continue;
      }

      const text =
        link.text.toLowerCase();

      const url =
        link.href.toLowerCase();

      const isPressRelease =
        text.includes("press release") ||
        text.includes("press note") ||
        url.includes("press") ||
        url.includes("press_note") ||
        url.includes("press%20");

      if (!isPressRelease) {
        continue;
      }

      /*
       * The "Press Releases" navigation page itself
       * is not a PDF and should not be processed.
       */

      if (
        !url.endsWith(".pdf")
      ) {
        continue;
      }

      results.push(link);
    }

    /*
     * Remove duplicate URLs.
     */

    const unique = [];
    const seen = new Set();

    for (
      const item of results
    ) {
      if (seen.has(item.href)) {
        continue;
      }

      seen.add(item.href);

      unique.push(item);
    }

    return unique;
  };

/*
|--------------------------------------------------------------------------
| Extract application dates from press release text
|--------------------------------------------------------------------------
*/

const extractApplicationDatesFromText =
  (text) => {
    const cleanText =
      normalizeText(text);

    const monthNames =
      "January|February|March|April|May|June|July|August|September|October|November|December";

    /*
     * Numeric date pattern.
     *
     * Example:
     * 19-08-2026 to 16-09-2026
     */

    const numericPattern =
      /(?:application|online application|applications).{0,300}?(\d{1,2}[-/]\d{1,2}[-/]\d{4}).{0,300}?(?:to|till|upto|up to|last date).{0,100}?(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i;

    /*
     * Written date pattern.
     *
     * Example:
     * 19th August 2026 to 16th September 2026
     */

    const writtenPattern =
      new RegExp(
        `(?:application|online application|applications).{0,500}?` +
          `(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})\\s+(\\d{4})` +
          `.{0,500}?` +
          `(?:to|till|upto|up to|last date|extended).{0,200}?` +
          `(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})\\s+(\\d{4})`,
        "i"
      );

    /*
     * Last date pattern.
     */

    const lastDatePattern =
      new RegExp(
        `(?:last date|last date of submission|extended.*?last date).{0,200}?` +
          `(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})\\s+(\\d{4})`,
        "i"
      );

    /*
     * Try numeric dates first.
     */

    const numericMatch =
      cleanText.match(
        numericPattern
      );

    if (numericMatch) {
      const startDate =
        convertDate(
          numericMatch[1]
        );

      const endDate =
        convertDate(
          numericMatch[2]
        );

      if (
        startDate &&
        endDate
      ) {
        return {
          startDate,
          endDate,
        };
      }
    }

    /*
     * Try written dates.
     */

    const writtenMatch =
      cleanText.match(
        writtenPattern
      );

    if (writtenMatch) {
      const startDate =
        monthNameToDate(
          writtenMatch[1],
          writtenMatch[2],
          writtenMatch[3]
        );

      const endDate =
        monthNameToDate(
          writtenMatch[4],
          writtenMatch[5],
          writtenMatch[6]
        );

      if (
        startDate &&
        endDate
      ) {
        return {
          startDate,
          endDate,
        };
      }
    }

    /*
     * Try extracting only the final deadline.
     */

    const lastDateMatch =
      cleanText.match(
        lastDatePattern
      );

    if (lastDateMatch) {
      const endDate =
        monthNameToDate(
          lastDateMatch[1],
          lastDateMatch[2],
          lastDateMatch[3]
        );

      if (endDate) {
        return {
          startDate: null,
          endDate,
        };
      }
    }

    return {
      startDate: null,
      endDate: null,
    };
  };

/*
|--------------------------------------------------------------------------
| Find application dates from press releases
|--------------------------------------------------------------------------
*/

const findApplicationDates =
  async (
    context,
    pressReleaseLinks
  ) => {
    let startDate = null;
    let endDate = null;

    for (
      const link of pressReleaseLinks
    ) {
      try {
        console.log(
          "\nChecking press release:",
          link.text
        );

        console.log(
          "URL:",
          link.href
        );

        const pdfBuffer =
          await downloadPdf(
            context,
            link.href
          );

        console.log(
          "PDF downloaded:",
          pdfBuffer.length,
          "bytes"
        );

        const text =
          await extractPdfText(
            pdfBuffer
          );

        if (!text) {
          console.log(
            "No PDF text found."
          );

          continue;
        }

        const dates =
          extractApplicationDatesFromText(
            text
          );

        /*
         * Complete application window found.
         */

        if (
          dates.startDate &&
          dates.endDate
        ) {
          /*
           * Keep the earliest known start date.
           */

          if (
            !startDate ||
            dates.startDate < startDate
          ) {
            startDate =
              dates.startDate;
          }

          /*
           * Keep the latest known end date.
           *
           * This is the important fix.
           */

          if (
            !endDate ||
            dates.endDate > endDate
          ) {
            endDate =
              dates.endDate;
          }

          console.log(
            "Application start found:",
            dates.startDate
          );

          console.log(
            "Application end found:",
            dates.endDate
          );

          continue;
        }

        /*
         * Only an end date was found.
         *
         * Never overwrite a newer deadline
         * with an older deadline.
         */

        if (dates.endDate) {
          if (
            !endDate ||
            dates.endDate > endDate
          ) {
            endDate =
              dates.endDate;
          }

          console.log(
            "Possible latest application end date:",
            dates.endDate
          );
        }
      } catch (error) {
        console.log(
          "Could not process press release:",
          error.message
        );
      }
    }

    return {
      startDate,
      endDate,
    };
  };

/*
|--------------------------------------------------------------------------
| Deactivate existing TGPRB jobs
|--------------------------------------------------------------------------
|
| This prevents old TGPRB jobs from remaining active
| after their application window has closed.
|--------------------------------------------------------------------------
*/

const deactivateClosedJobs =
  async () => {
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    await Job.updateMany(
      {
        source: "TGPRB",

        applicationEndDate: {
          $lt: today,
        },
      },
      {
        $set: {
          isActive: false,
        },
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Main Telangana Police collector
|--------------------------------------------------------------------------
*/

const fetchTelanganaPoliceJobs =
  async () => {
    console.log(
      "\n========================================"
    );

    console.log(
      "TELANGANA POLICE JOB COLLECTION"
    );

    console.log(
      "========================================"
    );

    const browser =
      await chromium.launch({
        headless: true,
      });

    const context =
      await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
      });

    const page =
      await context.newPage();

    try {
      /*
       * Open official TGPRB website.
       */

      console.log(
        "\nOpening TGPRB official website..."
      );

      await page.goto(
        TGPRB_URL,
        {
          waitUntil:
            "domcontentloaded",
          timeout: 60000,
        }
      );

      await page.waitForTimeout(
        3000
      );

      /*
       * Discover main recruitment
       * notifications.
       */

      const notifications =
        await discoverNotificationLinks(
          page
        );

      console.log(
        `Found ${notifications.length} main notifications.`
      );

      for (
        const item of notifications
      ) {
        console.log(
          "\n----------------------------------------"
        );

        console.log(
          "Recruitment:",
          item.recruitment.title
        );

        console.log(
          "Vacancies:",
          item.recruitment.vacancies
        );

        console.log(
          "Notification:",
          item.href
        );
      }

      /*
       * Discover press releases.
       */

      const pressReleaseLinks =
        await discoverPressReleaseLinks(
          page
        );

      console.log(
        `\nFound ${pressReleaseLinks.length} press release links.`
      );

      /*
       * Find application window.
       */

      const applicationDates =
        await findApplicationDates(
          context,
          pressReleaseLinks
        );

      console.log(
        "\n========================================"
      );

      console.log(
        "Application start:",
        applicationDates.startDate
      );

      console.log(
        "Application end:",
        applicationDates.endDate
      );

      /*
       * Do not save jobs if we could not
       * confidently determine the application
       * window.
       */

      if (
        !applicationDates.startDate ||
        !applicationDates.endDate
      ) {
        console.log(
          "\nApplication dates could not be determined confidently."
        );

        console.log(
          "Skipping TGPRB collection instead of saving incorrect dates."
        );

        return [];
      }

      /*
       * Deactivate already expired TGPRB jobs.
       */

      await deactivateClosedJobs();

      const results = [];

      /*
       * Process each recruitment.
       */

      for (
        const item of notifications
      ) {
        const recruitment =
          item.recruitment;

        const currentlyOpen =
          isApplicationOpen(
            applicationDates.startDate,
            applicationDates.endDate
          );

        console.log(
          "\n========================================"
        );

        console.log(
          "Processing:",
          recruitment.title
        );

        console.log(
          "Currently open:",
          currentlyOpen
        );

        /*
         * Don't save closed applications
         * as active jobs.
         */

        if (!currentlyOpen) {
          console.log(
            "Application closed. No active job saved."
          );

          continue;
        }

        const jobData = {
          title:
            recruitment.title,

          organization:
            "Telangana State Level Police Recruitment Board",

          category:
            "Telangana Police",

          vacancies:
            recruitment.vacancies,

          qualification: [],

          location:
            "Telangana",

          notificationDate:
            recruitment.notificationDate,

          applicationStartDate:
            applicationDates.startDate,

          applicationEndDate:
            applicationDates.endDate,

          examDate: null,

          notificationUrl:
            item.href,

          applyUrl:
            "https://www.tgprb.in/",

          source:
            "TGPRB",

          sourceId:
            recruitment.sourceId,

          description:
            `${recruitment.title} recruitment under Telangana Police Recruitment 2026.`,

          salary:
            recruitment.salary,

          ageLimit: "",

          isActive:
            true,
        };

        const savedJob =
          await Job.findOneAndUpdate(
            {
              source:
                "TGPRB",

              sourceId:
                recruitment.sourceId,
            },

            jobData,

            {
              upsert: true,

              returnDocument:
                "after",
            }
          );

        console.log(
          "TGPRB job saved successfully."
        );

        console.log(
          "MongoDB Job ID:",
          savedJob._id.toString()
        );

        results.push({
          sourceId:
            recruitment.sourceId,

          title:
            recruitment.title,

          vacancies:
            recruitment.vacancies,

          applicationStartDate:
            applicationDates.startDate,

          applicationEndDate:
            applicationDates.endDate,

          notificationUrl:
            item.href,
        });
      }

      console.log(
        "\n========================================"
      );

      console.log(
        "TELANGANA POLICE COLLECTION COMPLETE"
      );

      console.log(
        "========================================"
      );

      console.log(
        JSON.stringify(
          results,
          null,
          2
        )
      );

      return results;
    } finally {
      await context.close();

      await browser.close();
    }
  };

/*
|--------------------------------------------------------------------------
| Run directly
|--------------------------------------------------------------------------
*/

if (
  require.main === module
) {
  connectDB()
    .then(() => {
      return fetchTelanganaPoliceJobs();
    })
    .then(() => {
      console.log(
        "\nTelangana Police collection finished."
      );

      process.exit(0);
    })
    .catch((error) => {
      console.error(
        "\nTelangana Police collection failed:",
        error.message
      );

      process.exit(1);
    });
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports =
  fetchTelanganaPoliceJobs;