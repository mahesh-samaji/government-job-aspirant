const { chromium } = require("playwright");
const { PDFParse } = require("pdf-parse");

const connectDB = require("../../config/db");
const Job = require("../../models/Job");

const TGPSC_NOTIFICATIONS_URL =
  "https://websitenew.tgpsc.gov.in/notifications";

const MANAGER_NOTIFICATION_CODE = "04/OG/HM/2026";

const parseDate = (dateString) => {
  if (!dateString) {
    return null;
  }

  const [day, month, year] = dateString.split("/");

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
  );
};

const extractApplicationDates = (text) => {
  const startMatch = text.match(
    /Submission of Online Application From:\s*(\d{2}\/\d{2}\/\d{4})/i
  );

  const endMatch = text.match(
    /Last Date & Time of submission of\s*Online Application\s*(\d{2}\/\d{2}\/\d{4})\s*at\s*(\d{1,2}:\d{2}\s*[AP]M)/i
  );

  return {
    applicationStartDate: startMatch
      ? parseDate(startMatch[1])
      : null,

    applicationEndDate: endMatch
      ? parseDate(endMatch[1])
      : null,

    applicationEndTime: endMatch
      ? endMatch[2]
      : null,
  };
};

const extractJobDetails = (text) => {
  const notificationMatch = text.match(
    /NOTIFICATION NO\.\s*([A-Z0-9\/]+),\s*Dt\.\s*(\d{2}\/\d{2}\/\d{4})/i
  );

  const vacancyMatch = text.match(
    /Manager \(Engineering\) in\s*Hyderabad Metropolitan Water\s*Supply and Sewerage Board[\s\S]*?(\d+)\s+18[–-]44/i
  );

  const payMatch = text.match(
    /18[–-]44\s+([\d,]+-)\s*([\d,]+\/-)/i
  );

  const organizationMatch = text.match(
    /Manager \(Engineering\) in\s*Hyderabad Metropolitan Water\s*Supply and Sewerage Board/i
  );

  const applicationDates =
    extractApplicationDates(text);

  let salary = null;

  if (payMatch) {
    salary = `Rs. ${payMatch[1]}${payMatch[2]}`;
  }

  return {
    notificationNumber: notificationMatch
      ? notificationMatch[1]
      : null,

    notificationDate: notificationMatch
      ? parseDate(notificationMatch[2])
      : null,

    title: organizationMatch
      ? "Manager (Engineering)"
      : null,

    organization: organizationMatch
      ? "Hyderabad Metropolitan Water Supply and Sewerage Board"
      : null,

    vacancies: vacancyMatch
      ? Number(vacancyMatch[1])
      : null,

    ageLimit: "18-44",

    salary,

    applicationStartDate:
      applicationDates.applicationStartDate,

    applicationEndDate:
      applicationDates.applicationEndDate,

    applicationEndTime:
      applicationDates.applicationEndTime,
  };
};

const fetchTGPSCNotificationPdf = async () => {
  let browser;

  try {
    console.log("\n========================================");
    console.log("STARTING TGPSC JOB COLLECTION");
    console.log("========================================");

    // --------------------------------------------------
    // 1. Connect MongoDB
    // --------------------------------------------------

    console.log("\nConnecting to MongoDB...");

    await connectDB();

    console.log("MongoDB connection ready.");

    // --------------------------------------------------
    // 2. Launch browser
    // --------------------------------------------------

    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    // --------------------------------------------------
    // 3. Open TGPSC notifications page
    // --------------------------------------------------

    console.log("\nOpening TGPSC notifications page...");

    await page.goto(TGPSC_NOTIFICATIONS_URL, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    console.log("Notifications page opened.");

    // --------------------------------------------------
    // 4. Find notification
    // --------------------------------------------------

    const notificationLink = page
      .locator(
        `a:has-text("${MANAGER_NOTIFICATION_CODE}")`
      )
      .first();

    const count = await notificationLink.count();

    console.log(
      "\nNotification link count:",
      count
    );

    if (count === 0) {
      throw new Error(
        `Notification ${MANAGER_NOTIFICATION_CODE} not found.`
      );
    }

    const href =
      await notificationLink.getAttribute("href");

    if (!href) {
      throw new Error(
        "Notification PDF link not found."
      );
    }

    const pdfUrl = new URL(
      href,
      TGPSC_NOTIFICATIONS_URL
    ).href;

    console.log("\nPDF URL:");
    console.log(pdfUrl);

    // --------------------------------------------------
    // 5. Download PDF
    // --------------------------------------------------

    console.log("\nDownloading notification PDF...");

    const response =
      await context.request.get(pdfUrl, {
        headers: {
          Referer: TGPSC_NOTIFICATIONS_URL,
        },
        failOnStatusCode: false,
      });

    console.log(
      "Response status:",
      response.status()
    );

    const contentType =
      response.headers()["content-type"] || "";

    console.log(
      "Content-Type:",
      contentType
    );

    if (response.status() !== 200) {
      throw new Error(
        `PDF request failed with status ${response.status()}`
      );
    }

    if (!contentType.includes("application/pdf")) {
      throw new Error(
        `Expected PDF but received ${contentType}`
      );
    }

    const pdfBuffer =
      await response.body();

    console.log(
      "PDF downloaded:",
      pdfBuffer.length,
      "bytes"
    );

    // --------------------------------------------------
    // 6. Parse PDF
    // --------------------------------------------------

    console.log("\nParsing PDF...");

    const parser = new PDFParse({
      data: pdfBuffer,
    });

    const data = await parser.getText();

    await parser.destroy();

    const text = data.text || "";

    console.log(
      "Extracted text length:",
      text.length
    );

    // --------------------------------------------------
    // 7. Extract job
    // --------------------------------------------------

    console.log("\nExtracting job information...");

    const job = extractJobDetails(text);

    console.log("\n========================================");
    console.log("EXTRACTED TGPSC JOB");
    console.log("========================================");

    console.log(
      JSON.stringify(job, null, 2)
    );

    // --------------------------------------------------
    // 8. Validate important fields
    // --------------------------------------------------

    if (!job.notificationNumber) {
      throw new Error(
        "Notification number could not be extracted."
      );
    }

    if (!job.title) {
      throw new Error(
        "Job title could not be extracted."
      );
    }

    if (!job.applicationStartDate) {
      throw new Error(
        "Application start date could not be extracted."
      );
    }

    if (!job.applicationEndDate) {
      throw new Error(
        "Application end date could not be extracted."
      );
    }

    // --------------------------------------------------
    // 9. Check whether application is currently open
    // --------------------------------------------------

    const today = new Date();

    const todayStart = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );

    const isCurrentlyOpen =
      job.applicationStartDate <= todayStart &&
      todayStart <= job.applicationEndDate;

    console.log("\nApplication currently open:");
    console.log(isCurrentlyOpen);

    // --------------------------------------------------
    // 10. Save only currently open jobs
    // --------------------------------------------------

    if (!isCurrentlyOpen) {
      console.log(
        "\nApplication is not currently open."
      );

      console.log(
        "TGPSC job will not be saved."
      );

      return null;
    }

    const jobDocument = {
      title: job.title,

      organization: job.organization,

      category: "Telangana Government Job",

      vacancies: job.vacancies,

      qualification: [],

      location: "Telangana",

      notificationDate:
        job.notificationDate,

      applicationStartDate:
        job.applicationStartDate,

      applicationEndDate:
        job.applicationEndDate,

      examDate: null,

      notificationUrl: pdfUrl,

      applyUrl: "https://www.tgpsc.gov.in/",

      source: "TGPSC",

      sourceId: job.notificationNumber,

      description:
        `${job.title} recruitment notification ${job.notificationNumber}.`,

      salary: job.salary || "",

      ageLimit: job.ageLimit || "",

      isActive: true,
    };

    // --------------------------------------------------
    // 11. Upsert into MongoDB
    // --------------------------------------------------

    console.log(
      "\nSaving TGPSC job to MongoDB..."
    );

    const savedJob =
      await Job.findOneAndUpdate(
        {
          source: "TGPSC",
          sourceId: job.notificationNumber,
        },
        jobDocument,
        {
          upsert: true,
          returnDocument: "after",
        }
      );

    console.log(
      "\nTGPSC job saved successfully."
    );

    console.log(
      "MongoDB Job ID:",
      savedJob._id.toString()
    );

    console.log(
      "\n========================================"
    );

    console.log(
      "TGPSC JOB COLLECTION COMPLETED"
    );

    console.log(
      "========================================"
    );

    return savedJob;

  } catch (error) {
    console.error(
      "\nTGPSC job collection failed:"
    );

    console.error(
      "Message:",
      error.message
    );

    throw error;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = fetchTGPSCNotificationPdf;

if (require.main === module) {
  fetchTGPSCNotificationPdf();
}