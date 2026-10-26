// LEGACY RRB SERVICE
// DO NOT RUN.
// Replaced by the modular RRB pipeline in ./rrb/
const axios = require("axios");
const cheerio = require("cheerio");
const { PDFParse } = require("pdf-parse");

const Job = require("../models/Job");
const connectDB = require("../config/db");

// ============================================================
// OFFICIAL RRB SOURCES
// ============================================================

const RRB_SOURCES = [
  {
    region: "Chennai",
    baseUrl: "https://rrb.indianrailways.gov.in/chennai",
    pageUrl: "https://rrbchennai.gov.in/",
    location: "Chennai, Tamil Nadu",
  },
  {
    region: "Secunderabad",
    baseUrl: "https://rrbsecunderabad.gov.in",
    pageUrl: "https://rrbsecunderabad.gov.in/employment-notice/",
    location: "Secunderabad, Telangana",
  },
];

// ============================================================
// SETTINGS
// ============================================================

const CURRENT_YEAR = new Date().getFullYear();
const MIN_CEN_YEAR = CURRENT_YEAR - 1;

// ============================================================
// HTTP HEADERS
// ============================================================

const browserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
};

// ============================================================
// DATE HELPERS
// ============================================================

const parseDate = (value) => {
  if (!value) return null;

  const text = String(value).trim();

  let match = text.match(
    /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/
  );

  if (match) {
    const [, day, month, year] = match;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  match = text.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
  );

  if (match) {
    const date = new Date(text);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  return null;
};

const isApplicationOpen = (applicationEndDate) => {
  if (!applicationEndDate) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const endDate = new Date(applicationEndDate);

  endDate.setHours(23, 59, 59, 999);

  return endDate >= today;
};

// ============================================================
// CEN NUMBER EXTRACTION
// ============================================================

const extractCenNumber = (text) => {
  if (!text) return null;

  // ----------------------------------------------------------
  // Format:
  // CEN 05/2026
  // CEN-05-2026
  // CEN 05-2026
  // ----------------------------------------------------------

  let match = text.match(
    /CEN[\s._-]*(\d{1,2})[\s./_-]*(20\d{2})/i
  );

  if (match) {
    const number = match[1].padStart(2, "0");
    const year = match[2];

    return `${number}/${year}`;
  }

  // ----------------------------------------------------------
  // Official RRB Chennai URL format:
  // cenum=05/2026
  // ----------------------------------------------------------

  match = text.match(
    /cenum[=\s"'&]*(\d{1,2})[\/.-](20\d{2})/i
  );

  if (match) {
    const number = match[1].padStart(2, "0");
    const year = match[2];

    return `${number}/${year}`;
  }

  // ----------------------------------------------------------
  // Some RRB URLs use:
  // cennum=05/2026
  // ----------------------------------------------------------

  match = text.match(
    /cennum[=\s"'&]*(\d{1,2})[\/.-](20\d{2})/i
  );

  if (match) {
    const number = match[1].padStart(2, "0");
    const year = match[2];

    return `${number}/${year}`;
  }

  return null;
};

const isRecentCen = (cenNumber) => {
  if (!cenNumber) return false;

  const match = cenNumber.match(/\/(20\d{2})$/);

  if (!match) return false;

  const year = Number(match[1]);

  return year >= MIN_CEN_YEAR;
};

// ============================================================
// URL HELPER
// ============================================================

const makeAbsoluteUrl = (href, baseUrl) => {
  if (!href) return null;

  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
};

// ============================================================
// EXTRACT OFFICIAL PDF LINKS
// ============================================================

// ============================================================
// EXTRACT PDF LINKS
// ============================================================

// ============================================================
// EXTRACT PDF LINKS
// ============================================================

const extractPdfLinks = (html, baseUrl) => {
  const links = new Set();

  if (!html) {
    return [];
  }

  // ----------------------------------------------------------
  // Decode HTML entities and escaped slashes
  // ----------------------------------------------------------

  const decodedHtml = html
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/\\\//g, "/");

  // ----------------------------------------------------------
  // 1. Normal href/src attributes
  // ----------------------------------------------------------

  const attributePattern =
    /(?:href|src)\s*=\s*["']([^"']+)["']/gi;

  let match;

  while (
    (match = attributePattern.exec(decodedHtml)) !== null
  ) {
    const value = match[1];

    if (!value) {
      continue;
    }

    const lowerValue = value.toLowerCase();

    if (
      lowerValue.includes(".pdf") ||
      lowerValue.includes("/-/image/") ||
      lowerValue.includes("examsdocuments")
    ) {
      const absoluteUrl = makeAbsoluteUrl(
        value,
        baseUrl
      );

      if (absoluteUrl) {
        links.add(absoluteUrl);
      }
    }
  }

  // ----------------------------------------------------------
  // 2. RRB Chennai document paths
  //
  // Example:
  // /-/image/1789382253677CEN_05_2026_Paramedical_Categories_English.pdf/examsDocuments
  // ----------------------------------------------------------

  const imageDocumentPattern =
    /\/-\/image\/[^\s"'<>\\]+?\.pdf\/examsDocuments/gi;

  while (
    (match =
      imageDocumentPattern.exec(decodedHtml)) !== null
  ) {
    const value = match[0];

    const absoluteUrl = makeAbsoluteUrl(
      value,
      baseUrl
    );

    if (absoluteUrl) {
      links.add(absoluteUrl);
    }
  }

  // ----------------------------------------------------------
  // 3. Direct PDF URLs
  // ----------------------------------------------------------

  const directPdfPattern =
    /https?:\/\/[^\s"'<>\\]+?\.pdf(?:\/[^\s"'<>\\]*)?/gi;

  while (
    (match =
      directPdfPattern.exec(decodedHtml)) !== null
  ) {
    const value = match[0];

    const absoluteUrl = makeAbsoluteUrl(
      value,
      baseUrl
    );

    if (absoluteUrl) {
      links.add(absoluteUrl);
    }
  }

  return [...links];
};

// ============================================================
// CHENNAI NOTIFICATION PAGE
// ============================================================

const getChennaiNotificationPage = async (
  cenNumber
) => {
  const url =
  `https://rrb.indianrailways.gov.in/getdata` +
  `?loc=chennai` +
  `&cenum=${cenNumber}` +
  `&category=Notification`;

  console.log(
    `      Notification page: ${url}`
  );

  const response = await axios.get(url, {
    headers: browserHeaders,
    maxRedirects: 5,
    responseType: "text",
  });

  console.log("      Response status:", response.status);
console.log("      Response content-type:", response.headers["content-type"]);
console.log("      Response body:");
console.log(response.data);

  return response.data;
};

// ============================================================
// GET CHENNAI NOTIFICATION PDF
// ============================================================

const getChennaiNotificationPdf = async (cenNumber) => {
  const normalizedCen = cenNumber.replace("/", "_");

  const knownOfficialPdfs = {
    "05/2026":
      "https://rrb.indianrailways.gov.in/-/image/1789382253677CEN_05_2026_Paramedical_Categories_English.pdf/examsDocuments",

    "04/2026":
      "https://rrb.indianrailways.gov.in/-/image/1787058904504CEN_04_2026_JE_DMS_English.pdf/examsDocuments",

    "03/2026":
      "https://rrb.indianrailways.gov.in/-/image/1786369629062CORRIGENDUM_CEN_03_2026_SECTION_CONTROLLER_10.08.2026_(1).pdf/examsDocuments",
  };

  const pdfUrl = knownOfficialPdfs[cenNumber];

  if (!pdfUrl) {
    throw new Error(
      `No official Chennai PDF URL configured for CEN ${cenNumber}`
    );
  }

  console.log(`      Official PDF: ${pdfUrl}`);

  const response = await axios.get(pdfUrl, {
    headers: {
      ...browserHeaders,
      Accept: "application/pdf,*/*",
      Referer: "https://rrb.indianrailways.gov.in/",
    },
    responseType: "arraybuffer",
    timeout: 30000,
    maxRedirects: 5,
  });

  const contentType = response.headers["content-type"] || "";

  if (
    !contentType.toLowerCase().includes("pdf") &&
    !Buffer.from(response.data).subarray(0, 4).equals(Buffer.from("%PDF"))
  ) {
    throw new Error(
      `Official document is not a valid PDF. Content-Type: ${contentType}`
    );
  }

  return {
    pdfUrl,
    pdfBuffer: Buffer.from(response.data),
  };
};

// ============================================================
// DISCOVER CHENNAI CENs
// ============================================================

const discoverChennaiCens = async () => {
  console.log(
    "\n  Discovering RRB Chennai CENs..."
  );

  const response = await axios.get(
    "https://rrbchennai.gov.in/",
    {
      headers: browserHeaders,
      maxRedirects: 5,
      responseType: "text",
    }
  );

  const $ = cheerio.load(response.data);

  const cens = new Map();

  $("a").each((index, element) => {
    const text = $(element)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const href =
      $(element).attr("href") || "";

    const combined =
      `${text} ${href}`;

    const cenNumber =
      extractCenNumber(combined);

    if (!cenNumber) {
      return;
    }

    if (!isRecentCen(cenNumber)) {
      return;
    }

    // Only collect notification links.
    if (
      /category=Notification/i.test(
        href
      ) ||
      /Notification/i.test(text)
    ) {
      cens.set(cenNumber, {
        cenNumber,
        source: "RRB Chennai",
        region: "Chennai",
        location:
          "Chennai, Tamil Nadu",
      });
    }
  });

  return [...cens.values()];
};

// ============================================================
// DISCOVER SECUNDERABAD CENs
// ============================================================

const discoverSecunderabadCens =
  async () => {
    console.log(
      "\n  Discovering RRB Secunderabad CENs..."
    );

    try {
      const response =
        await axios.get(
          "https://rrbsecunderabad.gov.in/employment-notice/",
          {
            headers: browserHeaders,
            maxRedirects: 5,
            responseType: "text",
          }
        );

      const $ = cheerio.load(
        response.data
      );

      const cens = new Map();

      $("a").each(
        (index, element) => {
          const text = $(element)
            .text()
            .replace(/\s+/g, " ")
            .trim();

          const href =
            $(element).attr("href") ||
            "";

          const combined =
            `${text} ${href}`;

          const cenNumber =
            extractCenNumber(combined);

          if (!cenNumber) {
            return;
          }

          if (
            !isRecentCen(cenNumber)
          ) {
            return;
          }

          if (
            /notification|employment notice|cen/i.test(
              combined
            )
          ) {
            cens.set(cenNumber, {
              cenNumber,
              source:
                "RRB Secunderabad",
              region:
                "Secunderabad",
              location:
                "Secunderabad, Telangana",
              href,
            });
          }
        }
      );

      return [...cens.values()];
    } catch (error) {
      console.log(
        `  Secunderabad discovery failed: ${error.message}`
      );

      return [];
    }
  };

// ============================================================
// EXTRACT PDF TEXT
// ============================================================

const extractPdfText = async (
  buffer
) => {
  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result =
      await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
};

// ============================================================
// CLEAN PDF TEXT
// ============================================================

const cleanPdfText = (text) => {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ============================================================
// EXTRACT APPLICATION DATES
// ============================================================

const extractApplicationDates = (
  text
) => {
  const cleanText =
    cleanPdfText(text)
      .replace(/\s+/g, " ")
      .trim();

  // ----------------------------------------------------------
  // CEN 03/2026 specific fallback
  // Official application window:
  // 15.07.2026 to 14.08.2026
  // ----------------------------------------------------------

  if (
    /CEN\s*(?:No\.)?\s*03[\/-]2026/i.test(cleanText)
  ) {
    const dates =
      cleanText.match(
        /\b15[./-]07[./-]2026\b.*?\b14[./-]08[./-]2026\b/
      );

    if (dates) {
      return {
        applicationStartDate:
          parseDate("15.07.2026"),

        applicationEndDate:
          parseDate("14.08.2026"),
      };
    }
  }

  let applicationStartDate = null;
  let applicationEndDate = null;

  // ----------------------------------------------------------
  // Pattern 1:
  // "Dates for submission of online applications"
  // followed by two dates
  // ----------------------------------------------------------

  let match = cleanText.match(
    /(?:date|dates).*?(?:submission|submit).*?(?:online\s+)?applications?.{0,300}?(\d{1,2}[./-]\d{1,2}[./-]\d{4}).{0,300}?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i
  );

  if (match) {
    applicationStartDate =
      parseDate(match[1]);

    applicationEndDate =
      parseDate(match[2]);
  }

  // ----------------------------------------------------------
  // Pattern 2:
  // "Online application ... from DATE to DATE"
  // ----------------------------------------------------------

  if (
    !applicationStartDate ||
    !applicationEndDate
  ) {
    match = cleanText.match(
      /(?:online\s+)?applications?.{0,250}?(?:from|between)\s+(\d{1,2}[./-]\d{1,2}[./-]\d{4}).{0,250}?(?:to|upto|up\s+to|till|until)\s+(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i
    );

    if (match) {
      applicationStartDate =
        parseDate(match[1]);

      applicationEndDate =
        parseDate(match[2]);
    }
  }

  // ----------------------------------------------------------
  // Pattern 3:
  // "Opening date/time" ... "Closing date/time"
  // ----------------------------------------------------------

  if (
    !applicationStartDate ||
    !applicationEndDate
  ) {
    match = cleanText.match(
      /opening\s+(?:date|time).*?(\d{1,2}[./-]\d{1,2}[./-]\d{4}).{0,500}?closing\s+(?:date|time).*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i
    );

    if (match) {
      applicationStartDate =
        parseDate(match[1]);

      applicationEndDate =
        parseDate(match[2]);
    }
  }

  // ----------------------------------------------------------
  // Pattern 4:
  // Look specifically around "application" and collect
  // the first two dates.
  //
  // This handles PDFs where labels and dates are separated
  // by unusual line breaks or table formatting.
  // ----------------------------------------------------------

  if (
    !applicationStartDate ||
    !applicationEndDate
  ) {
    const applicationIndex =
      cleanText.search(
        /(?:online\s+application|online\s+applications|application\s+form|submission\s+of\s+application)/i
      );

    if (applicationIndex !== -1) {
      const applicationSection =
        cleanText.substring(
          applicationIndex,
          applicationIndex + 2500
        );

      const dates =
        applicationSection.match(
          /\d{1,2}[./-]\d{1,2}[./-]\d{4}/g
        );

      if (
        dates &&
        dates.length >= 2
      ) {
        applicationStartDate =
          parseDate(dates[0]);

        applicationEndDate =
          parseDate(dates[1]);
      }
    }
  }

  // ----------------------------------------------------------
  // Pattern 5:
  // Final fallback:
  // Find pairs of dates near application-related text.
  // ----------------------------------------------------------

  if (
    !applicationStartDate ||
    !applicationEndDate
  ) {
    const dateMatches = [
      ...cleanText.matchAll(
        /\d{1,2}[./-]\d{1,2}[./-]\d{4}/g
      ),
    ];

    for (
      let i = 0;
      i < dateMatches.length - 1;
      i++
    ) {
      const firstDate =
        dateMatches[i][0];

      const secondDate =
        dateMatches[i + 1][0];

      const startPosition =
        dateMatches[i].index;

      const contextStart =
        Math.max(
          0,
          startPosition - 500
        );

      const context =
        cleanText.substring(
          contextStart,
          startPosition + 500
        );

      if (
        /application|submission|online|recruitment/i.test(
          context
        )
      ) {
        const parsedStart =
          parseDate(firstDate);

        const parsedEnd =
          parseDate(secondDate);

        if (
          parsedStart &&
          parsedEnd &&
          parsedEnd >= parsedStart
        ) {
          applicationStartDate =
            parsedStart;

          applicationEndDate =
            parsedEnd;

          break;
        }
      }
    }
  }

  return {
    applicationStartDate,
    applicationEndDate,
  };
};

// ============================================================
// EXTRACT VACANCIES
// ============================================================

const extractVacancies = (
  text
) => {
  const cleanText =
    cleanPdfText(text);

  const patterns = [
    /total\s+(?:number\s+of\s+)?vacancies?\s*[:\-]?\s*([\d,]+)/i,

    /total\s+vacancies?\s*[:\-]?\s*([\d,]+)/i,

    /vacancies?\s*[:\-]\s*([\d,]+)/i,
  ];

  for (const pattern of patterns) {
    const match =
      cleanText.match(pattern);

    if (match) {
      return Number(
        match[1].replace(/,/g, "")
      );
    }
  }

  return null;
};

// ============================================================
// EXTRACT JOB TITLE
// ============================================================

const extractJobTitle = (
  text,
  cenNumber
) => {
  const cleanText =
    cleanPdfText(text);

  const titlePatterns = [
    /(Paramedical Categories)/i,
    /(Junior Engineer)/i,
    /(Section Controller)/i,
    /(Technician)/i,
    /(Assistant Loco Pilot)/i,
  ];

  for (const pattern of titlePatterns) {
    const match =
      cleanText.match(pattern);

    if (match) {
      return match[1].trim();
    }
  }

  return `Railway Recruitment - CEN ${cenNumber}`;
};

// ============================================================
// BUILD JOB
// ============================================================

const buildJob = ({
  cenNumber,
  region,
  location,
  pdfUrl,
  pdfText,
}) => {
  const {
    applicationStartDate,
    applicationEndDate,
  } =
    extractApplicationDates(
      pdfText
    );

  const vacancies =
    extractVacancies(pdfText);

  const title =
    extractJobTitle(
      pdfText,
      cenNumber
    );

  return {
    title,

    organization:
      "Railway Recruitment Board",

    category:
      "Railway",

    vacancies,

    qualification: [],

    location,

    notificationDate:
      new Date(),

    applicationStartDate,

    applicationEndDate,

    examDate: null,

    notificationUrl:
      pdfUrl,

    applyUrl:
      "https://www.rrbapply.gov.in/",

    source:
      `RRB ${region}`,

    sourceId:
      `${region}-${cenNumber}`,

    description:
      `Official Railway Recruitment Board notification for CEN ${cenNumber}.`,

    salary: "",

    ageLimit: "",

    isActive: true,
  };
};

// ============================================================
// SAVE ONLY IF APPLICATION IS OPEN
// ============================================================

const saveJobIfOpen = async (
  job
) => {
  // No closing date = do not import.
  if (!job.applicationEndDate) {
    console.log(
      `      SKIPPED: Application closing date could not be extracted.`
    );

    return "skipped";
  }

  // Closing date has passed = do not import.
  if (
    !isApplicationOpen(
      job.applicationEndDate
    )
  ) {
    console.log(
      `      SKIPPED: Application closed on ${job.applicationEndDate.toDateString()}`
    );

    return "skipped";
  }

  await Job.findOneAndUpdate(
    {
      source: job.source,
      sourceId: job.sourceId,
    },
    job,
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  console.log(
    `      SAVED: ${job.title}`
  );

  return "saved";
};

// ============================================================
// PROCESS CHENNAI CEN
// ============================================================

const processChennaiCen = async (
  cen
) => {
  console.log(
    `\n  Processing Chennai ${cen.cenNumber}`
  );

  const result =
    await getChennaiNotificationPdf(
      cen.cenNumber
    );

  if (!result) {
    console.log(
      `      FAILED: Official PDF not found.`
    );

    return "failed";
  }

  const pdfText =
    result.pdfText ||
    (await extractPdfText(result.buffer));

  const job = buildJob({
    cenNumber:
      cen.cenNumber,

    region:
      "Chennai",

    location:
      cen.location,

    pdfUrl:
      result.pdfUrl,

    pdfText,
  });

  console.log(
    `      Application start:`,
    job.applicationStartDate
  );

  console.log(
    `      Application end:`,
    job.applicationEndDate
  );

  console.log(
    `      Vacancies:`,
    job.vacancies
  );

  return saveJobIfOpen(job);
};

// ============================================================
// PROCESS SECUNDERABAD CEN
// ============================================================

const processSecunderabadCen =
  async (cen) => {
    console.log(
      `\n  Processing Secunderabad ${cen.cenNumber}`
    );

    const response =
      await axios.get(
        cen.href,
        {
          headers: browserHeaders,
          maxRedirects: 5,
          responseType: "text",
        }
      );

    const pdfLinks =
      extractPdfLinks(
        response.data,
        "https://rrbsecunderabad.gov.in/"
      );

    console.log(
      `      PDF candidates: ${pdfLinks.length}`
    );

    const notificationCandidates =
      pdfLinks.filter((url) =>
        /cen|notification/i.test(
          url
        )
      );

    const candidates =
      notificationCandidates.length >
      0
        ? notificationCandidates
        : pdfLinks;

    for (const pdfUrl of candidates) {
      try {
        const pdfResponse =
          await axios.get(
            pdfUrl,
            {
              headers:
                browserHeaders,

              responseType:
                "arraybuffer",

              maxRedirects: 5,

              validateStatus:
                () => true,
            }
          );

        const buffer =
          Buffer.from(
            pdfResponse.data
          );

        if (
          pdfResponse.status !==
            200 ||
          buffer
            .subarray(0, 5)
            .toString() !== "%PDF-"
        ) {
          continue;
        }

        const pdfText =
          await extractPdfText(
            buffer
          );

        const job =
          buildJob({
            cenNumber:
              cen.cenNumber,

            region:
              "Secunderabad",

            location:
              cen.location,

            pdfUrl,

            pdfText,
          });

        console.log(
          `      Application start:`,
          job.applicationStartDate
        );

        console.log(
          `      Application end:`,
          job.applicationEndDate
        );

        console.log(
          `      Vacancies:`,
          job.vacancies
        );

        return saveJobIfOpen(
          job
        );
      } catch (error) {
        console.log(
          `      PDF failed: ${error.message}`
        );
      }
    }

    console.log(
      `      FAILED: Notification PDF not found.`
    );

    return "failed";
  };

// ============================================================
// MAIN IMPORTER
// ============================================================

const fetchRRBJobs = async () => {
  console.log(
    "\n========================================"
  );

  console.log(
    "GovPrep RRB Job Importer"
  );

  console.log(
    "========================================\n"
  );

  const summary = {
    saved: 0,
    skipped: 0,
    failed: 0,
  };

  // ==========================================================
  // CHENNAI
  // ==========================================================

  const chennaiCens =
    await discoverChennaiCens();

  console.log(
    `\n  Chennai recent CEN notifications found: ${chennaiCens.length}`
  );

  for (const cen of chennaiCens) {
    try {
      const result =
        await processChennaiCen(
          cen
        );

      if (result === "saved") {
        summary.saved++;
      } else if (
        result === "skipped"
      ) {
        summary.skipped++;
      } else {
        summary.failed++;
      }
    } catch (error) {
      console.log(
        `      FAILED: ${error.message}`
      );

      summary.failed++;
    }
  }

  // ==========================================================
  // SECUNDERABAD
  // ==========================================================

  const secunderabadCens =
    await discoverSecunderabadCens();

  console.log(
    `\n  Secunderabad recent CENs found: ${secunderabadCens.length}`
  );

  for (const cen of secunderabadCens) {
    try {
      const result =
        await processSecunderabadCen(
          cen
        );

      if (result === "saved") {
        summary.saved++;
      } else if (
        result === "skipped"
      ) {
        summary.skipped++;
      } else {
        summary.failed++;
      }
    } catch (error) {
      console.log(
        `      FAILED: ${error.message}`
      );

      summary.failed++;
    }
  }

  // ==========================================================
  // SUMMARY
  // ==========================================================

  console.log(
    "\n========================================"
  );

  console.log(
    "RRB IMPORT COMPLETE"
  );

  console.log(
    "========================================"
  );

  console.log(
    `Saved:   ${summary.saved}`
  );

  console.log(
    `Skipped: ${summary.skipped}`
  );

  console.log(
    `Failed:  ${summary.failed}`
  );

  console.log(
    "========================================\n"
  );

  return summary;
};

// ============================================================
// DIRECT EXECUTION
// ============================================================

if (require.main === module) {
  (async () => {
    try {
      await connectDB();

      await fetchRRBJobs();

      process.exit(0);
    } catch (error) {
      console.error(
        "\nRRB importer failed:",
        error
      );

      process.exit(1);
    }
  })();
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  fetchRRBJobs,
  discoverChennaiCens,
  discoverSecunderabadCens,
};