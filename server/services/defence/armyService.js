const { chromium } = require("playwright");
const { PDFParse } = require("pdf-parse");
const axios = require("axios");

const Job = require("../../models/Job");
const connectDB = require("../../config/db");

const ARMY_URL = "https://joinindianarmy.nic.in/";

const normalizeText = (text) => {
  return String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const parseDate = (dateString) => {
  if (!dateString) return null;

  const cleaned = dateString.trim();

  let match = cleaned.match(
    /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/
  );

  if (match) {
    const [, day, month, year] = match;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  match = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/i
  );

  if (match) {
    const [, day, monthName, year] = match;

    const monthMap = {
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

    const month = monthMap[monthName.toLowerCase()];

    if (month !== undefined) {
      return new Date(
        Number(year),
        month,
        Number(day)
      );
    }
  }

  return null;
};

const isApplicationOpen = (startDate, endDate) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return today >= start && today <= end;
};

const extractApplicationDates = (text) => {
  const cleanText = normalizeText(text);

  const patterns = [
    /(?:online applications?|applications?)\s+(?:are\s+)?(?:invited|open).*?from\s+(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}).*?(?:to|till|upto|up to|until)\s+(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,

    /(?:apply|application).*?(?:from|between)\s+(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}).*?(?:to|till|upto|up to|until)\s+(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,

    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}).*?(?:to|till|upto|up to|until).*?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      const startDate = parseDate(match[1]);
      const endDate = parseDate(match[2]);

      if (startDate && endDate) {
        return {
          startDate,
          endDate,
        };
      }
    }
  }

  return {
    startDate: null,
    endDate: null,
  };
};

const extractVacancyCount = (text) => {
  const cleanText = normalizeText(text);

  const patterns = [
    /(?:total\s+)?vacancies?\s*[:\-]?\s*(\d{1,5})/i,
    /(\d{1,5})\s+(?:vacancies|posts|positions)/i,
    /(?:vacancies|posts|positions)\s+(?:are|is)\s+(\d{1,5})/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
};

const extractAgeLimit = (text) => {
  const cleanText = normalizeText(text);

  const patterns = [
    /age\s*(?:limit|criteria)?\s*[:\-]?\s*(\d{1,2}\s*(?:to|-)\s*\d{1,2})/i,

    /(\d{1,2})\s*(?:years?)?\s*(?:to|-)\s*(\d{1,2})\s*years?/i,

    /(?:between|from)\s+(\d{1,2})\s*(?:years?)?\s+(?:and|to|-)\s+(\d{1,2})\s*years?/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      if (match.length >= 3) {
        return `${match[1]}-${match[2]} years`;
      }

      return match[1];
    }
  }

  return "";
};

const extractSalary = (text) => {
  const cleanText = normalizeText(text);

  const patterns = [
    /(?:pay|salary|pay\s*scale|stipend|remuneration)\s*[:\-]?\s*(?:rs\.?|₹)\s*[\d,]+(?:\s*[-–]\s*[\d,]+)?/i,

    /(?:rs\.?|₹)\s*[\d,]+(?:\s*[-–]\s*[\d,]+)?\s*(?:per\s+month|monthly)?/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      const value = normalizeText(match[0]);

      // Avoid clearly incomplete fragments.
      if (
        value.length > 8 &&
        !/Rs\.?\s*$/i.test(value) &&
        !/₹\s*$/i.test(value)
      ) {
        return value;
      }
    }
  }

  return "";
};

const extractTitle = (text, fallbackTitle) => {
  const cleanText = normalizeText(text);

  const titlePatterns = [
    /(?:recruitment|entry|course)\s+(?:notification|2026|2027)?\s*[:\-]?\s*([A-Z][A-Za-z0-9()&,\- ]{10,120})/i,

    /(?:name of (?:entry|post|course))\s*[:\-]\s*([A-Za-z0-9()&,\- ]{5,120})/i,
  ];

  for (const pattern of titlePatterns) {
    const match = cleanText.match(pattern);

    if (match && match[1]) {
      const title = normalizeText(match[1]);

      if (title.length >= 5) {
        return title;
      }
    }
  }

  return fallbackTitle || "Indian Army Recruitment";
};

const extractPdfText = async (pdfBuffer) => {
  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
};

const downloadPdf = async (pdfUrl) => {
  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0 Safari/537.36",
      Accept: "application/pdf,*/*",
    },
  });

  return Buffer.from(response.data);
};

const discoverArmyDocuments = async (page) => {
  await page.goto(ARMY_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(5000);

  const documents = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));

    return links
      .map((link) => {
        const href = link.href || "";
        const text = (link.innerText || link.textContent || "")
          .replace(/\s+/g, " ")
          .trim();

        return {
          href,
          text,
        };
      })
      .filter((item) => {
        if (!item.href) return false;

        const combined =
          `${item.text} ${item.href}`.toLowerCase();

        return (
          combined.includes("notification") ||
          combined.includes("recruitment") ||
          combined.includes("entry") ||
          combined.includes("agniveer") ||
          combined.includes("technical graduate") ||
          combined.includes("ssc tech") ||
          combined.includes("jag") ||
          combined.includes(".pdf")
        );
      });
  });

  const unique = new Map();

  for (const document of documents) {
    if (!unique.has(document.href)) {
      unique.set(document.href, document);
    }
  }

  return Array.from(unique.values());
};

const processArmyDocument = async (document) => {
  if (!document.href) {
    return null;
  }

  const hrefLower = document.href.toLowerCase();

  if (
    !hrefLower.endsWith(".pdf") &&
    !hrefLower.includes(".pdf?")
  ) {
    return null;
  }

  console.log(`\nChecking Army document: ${document.text}`);
  console.log(`PDF: ${document.href}`);

  let pdfBuffer;

  try {
    pdfBuffer = await downloadPdf(document.href);
  } catch (error) {
    console.log(
      `Unable to download Army PDF: ${error.message}`
    );

    return null;
  }

  const text = await extractPdfText(pdfBuffer);

  if (!text) {
    console.log("Army PDF text extraction failed.");
    return null;
  }

  const cleanText = normalizeText(text);

  const dates = extractApplicationDates(cleanText);

  if (!dates.startDate || !dates.endDate) {
    console.log(
      "Application dates not confidently found. Skipping."
    );

    return null;
  }

  if (!isApplicationOpen(dates.startDate, dates.endDate)) {
    console.log("Army application is not currently open. Skipping.");

    return null;
  }

  const title = extractTitle(
    cleanText,
    document.text
  );

  const vacancies = extractVacancyCount(cleanText);
  const ageLimit = extractAgeLimit(cleanText);
  const salary = extractSalary(cleanText);

  const sourceId =
    document.href.match(
      /([^/]+)\.pdf(?:\?.*)?$/i
    )?.[1] ||
    Buffer.from(document.href)
      .toString("base64")
      .slice(0, 80);

  const job = {
    title,
    organization: "Indian Army",
    category: "Defence",
    vacancies,
    qualification: [],
    location: "India",

    notificationDate: null,

    applicationStartDate: dates.startDate,
    applicationEndDate: dates.endDate,

    examDate: null,

    notificationUrl: document.href,
    applyUrl: ARMY_URL,

    source: "Indian Army",
    sourceId,

    description:
      "Indian Army recruitment opportunity published through the official Join Indian Army recruitment portal.",

    salary,
    ageLimit,

    isActive: true,
  };

  const savedJob = await Job.findOneAndUpdate(
    {
      source: job.source,
      sourceId: job.sourceId,
    },
    job,
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  console.log("ARMY JOB SAVED");
  console.log(`Title: ${job.title}`);
  console.log(`Vacancies: ${job.vacancies ?? "Not specified"}`);
  console.log(
    `Application: ${job.applicationStartDate.toISOString().slice(0, 10)} → ${job.applicationEndDate.toISOString().slice(0, 10)}`
  );

  return savedJob;
};

const fetchArmyJobs = async () => {
  console.log("\n========================================");
  console.log("INDIAN ARMY JOB COLLECTION STARTED");
  console.log("========================================");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 900,
    },
  });

  try {
    console.log("Opening official Join Indian Army portal...");

    const documents = await discoverArmyDocuments(page);

    console.log(
      `Army recruitment/document links discovered: ${documents.length}`
    );

    const results = [];

    for (const document of documents) {
      try {
        const result = await processArmyDocument(document);

        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(
          `Army document processing failed: ${error.message}`
        );
      }
    }

    console.log("\n========================================");
    console.log("INDIAN ARMY COLLECTION COMPLETE");
    console.log("========================================");

    console.log(`Jobs saved/updated: ${results.length}`);

    return results;
  } finally {
    await browser.close();
  }
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();

      await fetchArmyJobs();

      console.log(
        "\nIndian Army collection process finished."
      );
    } catch (error) {
      console.error(
        "\nIndian Army collection failed:",
        error.message
      );

      process.exitCode = 1;
    }
  })();
}

module.exports = fetchArmyJobs;