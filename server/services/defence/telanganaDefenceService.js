const axios = require("axios");
const cheerio = require("cheerio");
const { PDFParse } = require("pdf-parse");

const Job = require("../../models/Job");
const connectDB = require("../../config/db");

const DRDO_VACANCIES_URL =
  "https://drdo.gov.in/drdo/offerings/vacancies";

/*
|--------------------------------------------------------------------------
| Known Telangana DRDO Notices
|--------------------------------------------------------------------------
|
| This fallback ensures that important Telangana DRDO opportunities are
| still detected even if the main vacancies page changes its HTML structure.
|
*/

const KNOWN_TELANGANA_NOTICES = [
  {
    title:
      "DYSL-SM, Hyderabad invites eligible candidates for walk in interview for the award of Junior Research Fellowship (JRF)",

    url:
      "https://drdo.gov.in/drdo/en/offerings/vacancies/dysl-sm-hyderabad-invites-eligible-candidates-walk-interview-award-junior",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const cleanText = (text = "") => {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
};

const normalizeSpaces = (text = "") => {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const makeAbsoluteUrl = (url) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `https://drdo.gov.in${url}`;
  }

  return new URL(url, DRDO_VACANCIES_URL).href;
};

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const convertDate = (dateString) => {
  if (!dateString) {
    return null;
  }

  const cleaned = dateString.trim();

  let day;
  let month;
  let year;

  // DD/MM/YYYY
  let match = cleaned.match(
    /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/
  );

  if (match) {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);

    return new Date(year, month - 1, day);
  }

  // DD Month YYYY
  match = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/i
  );

  if (match) {
    day = Number(match[1]);
    year = Number(match[3]);

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

    month = months[match[2].toLowerCase()];

    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  return null;
};

const extractDateFromText = (text, label) => {
  if (!text) {
    return null;
  }

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const patterns = [
    new RegExp(
      `${escapedLabel}\\s*[:\\-]?\\s*(\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{4})`,
      "i"
    ),

    new RegExp(
      `${escapedLabel}\\s*[:\\-]?\\s*(\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4})`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return convertDate(match[1]);
    }
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Telangana Notice Discovery
|--------------------------------------------------------------------------
*/

const discoverTelanganaNotices = async () => {
  const notices = [];

  try {
    const response = await axios.get(DRDO_VACANCIES_URL, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const $ = cheerio.load(response.data);

    $("a").each((index, element) => {
      const title = normalizeSpaces($(element).text());
      const href = $(element).attr("href");

      if (!title || !href) {
        return;
      }

      const lowerTitle = title.toLowerCase();

      const isTelanganaNotice =
        lowerTitle.includes("hyderabad") ||
        lowerTitle.includes("telangana");

      if (!isTelanganaNotice) {
        return;
      }

      notices.push({
        title,
        url: makeAbsoluteUrl(href),
      });
    });
  } catch (error) {
    console.error(
      "DRDO vacancies page discovery failed:",
      error.message
    );
  }

  /*
   * Add known official Telangana notices as fallback.
   */

  for (const knownNotice of KNOWN_TELANGANA_NOTICES) {
    const alreadyExists = notices.some(
      (notice) => notice.url === knownNotice.url
    );

    if (!alreadyExists) {
      notices.push(knownNotice);
    }
  }

  /*
   * Remove duplicate URLs.
   */

  const uniqueNotices = [];
  const seenUrls = new Set();

  for (const notice of notices) {
    if (!seenUrls.has(notice.url)) {
      seenUrls.add(notice.url);
      uniqueNotices.push(notice);
    }
  }

  return uniqueNotices;
};

/*
|--------------------------------------------------------------------------
| Fetch Notice Details
|--------------------------------------------------------------------------
*/

const getNoticeDetails = async (notice) => {
  const response = await axios.get(notice.url, {
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const $ = cheerio.load(response.data);

  const bodyText = normalizeSpaces($("body").text());

  const pdfLinks = [];

  $("a").each((index, element) => {
    const href = $(element).attr("href");
    const linkText = normalizeSpaces($(element).text());

    if (!href) {
      return;
    }

    const absoluteUrl = makeAbsoluteUrl(href);

    if (
      absoluteUrl.toLowerCase().includes(".pdf") ||
      linkText.toLowerCase().includes("advertisement") ||
      linkText.toLowerCase().includes("application")
    ) {
      pdfLinks.push({
        url: absoluteUrl,
        text: linkText,
      });
    }
  });

  /*
   * Prefer the advertisement/application PDF.
   */

  let pdfUrl = "";

  const preferredPdf = pdfLinks.find((item) =>
    /advertisement|application/i.test(item.text)
  );

  if (preferredPdf) {
    pdfUrl = preferredPdf.url;
  } else {
    const firstPdf = pdfLinks.find((item) =>
      item.url.toLowerCase().includes(".pdf")
    );

    if (firstPdf) {
      pdfUrl = firstPdf.url;
    }
  }

  return {
    bodyText,
    pdfUrl,
  };
};

/*
|--------------------------------------------------------------------------
| Download PDF
|--------------------------------------------------------------------------
*/

const downloadPdf = async (pdfUrl) => {
  if (!pdfUrl) {
    throw new Error("No official DRDO PDF found.");
  }

  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
    timeout: 60000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
      Accept: "application/pdf,*/*",
    },
  });

  return Buffer.from(response.data);
};

/*
|--------------------------------------------------------------------------
| Extract PDF Text
|--------------------------------------------------------------------------
*/

const extractPdfText = async (pdfBuffer) => {
  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();

    return cleanText(result.text || "");
  } finally {
    await parser.destroy();
  }
};

/*
|--------------------------------------------------------------------------
| Extract Advertisement Number
|--------------------------------------------------------------------------
*/

const extractAdvertisementNumber = (text) => {
  const match = text.match(
    /(?:Advertisement\s*(?:No\.?|Number)|Advt\.?\s*No\.?)\s*[:\-]?\s*([A-Z0-9\/._-]+)/i
  );

  if (match) {
    return match[1].trim();
  }

  const fallback = text.match(
    /DYSL[-\s]SM\/HRD\/JRF\/REC\/\d{4}\/\d+/i
  );

  return fallback ? fallback[0].trim() : "";
};

/*
|--------------------------------------------------------------------------
| Extract Vacancy Count
|--------------------------------------------------------------------------
*/

const extractVacancyCount = (text) => {
  const patterns = [
    /(?:No\.?\s*of\s*)?(?:vacancies|vacancy|posts?)\s*[:\-]?\s*(\d+)/i,

    /(\d+)\s+(?:vacancies|vacancy|posts?)/i,

    /(?:JRF|Junior Research Fellow)[^\d]{0,100}(\d+)\s*(?:post|posts|vacancies?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return 1;
};

/*
|--------------------------------------------------------------------------
| Extract Qualification
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We intentionally return a short qualification summary instead of the
| complete eligibility paragraph.
|
*/

const extractQualification = (text) => {
  if (!text) {
    return [];
  }

  const normalizedText = normalizeSpaces(text);

  /*
   * First try to find the qualification section.
   */

  const qualificationMatch = normalizedText.match(
    /(?:Essential\s+Qualification|Essential\s+Qualifications|Educational\s+Qualification|Educational\s+Qualifications|Qualification|Qualifications)\s*[:\-]?\s*(.*?)(?=\b(?:Age|Upper\s+Age|Age\s+Limit|Salary|Stipend|Emoluments|Walk[-\s]?in|Interview|Date|Venue|How\s+to\s+Apply|Terms\s+and\s+Conditions)\b)/i
  );

  let qualification = qualificationMatch
    ? qualificationMatch[1].trim()
    : normalizedText;

  qualification = normalizeSpaces(qualification);

  /*
   * Main DRDO case:
   *
   * B.E/B.Tech in Mechanical/Mechatronics Engineering
   *
   * We intentionally stop before:
   * "with First Class"
   * "with a valid GATE score"
   * "OR"
   */

  const degreeMatch = qualification.match(
    /((?:B\.?\s*E\.?|B\.?\s*Tech\.?|B\.?\s*E\.?\s*\/\s*B\.?\s*Tech\.?)\s+in\s+[^.;]+?)(?=\s+with\s+First\s+Class|\s+with\s+a\s+valid|\s+with\s+valid|\s*\(\s*OR|\s+OR\s+|$)/i
  );

  if (degreeMatch) {
    let shortQualification = degreeMatch[1]
      .replace(/\s+/g, " ")
      .trim();

    shortQualification = shortQualification
      .replace(/\.\s*$/, "")
      .trim();

    return [shortQualification];
  }

  /*
   * Handle cases such as:
   *
   * M.E./M.Tech in Mechanical/Mechatronics/...
   */

  const mastersMatch = qualification.match(
    /((?:M\.?\s*E\.?|M\.?\s*Tech\.?)\s+in\s+[^.;]+?)(?=\s+with\s+First\s+Class|\s+with\s+a\s+valid|\s+OR\s+|$)/i
  );

  if (mastersMatch) {
    let shortQualification = mastersMatch[1]
      .replace(/\s+/g, " ")
      .trim();

    shortQualification = shortQualification
      .replace(/\.\s*$/, "")
      .trim();

    return [shortQualification];
  }

  /*
   * Generic fallback.
   *
   * Do not allow a huge paragraph into the JobCard.
   */

  const firstSentence = qualification
    .split(/(?<=[.;])\s+/)[0]
    .trim();

  if (!firstSentence) {
    return [];
  }

  if (firstSentence.length > 150) {
    return [
      `${firstSentence.substring(0, 147).trim()}...`,
    ];
  }

  return [firstSentence];
};

/*
|--------------------------------------------------------------------------
| Extract Salary / Stipend
|--------------------------------------------------------------------------
*/

const extractSalary = (text) => {
  if (!text) {
    return "";
  }

  const patterns = [
    /(?:stipend|salary|emoluments|remuneration)\s*[:\-]?\s*(Rs\.?\s*[\d,]+(?:\s*\/?-?\s*(?:month|per\s+month|pm))?)/i,

    /(Rs\.?\s*[\d,]+)\s*(?:per\s+month|\/month|pm)/i,

    /(₹\s*[\d,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return normalizeSpaces(match[1]);
    }
  }

  return "";
};

/*
|--------------------------------------------------------------------------
| Extract Age Limit
|--------------------------------------------------------------------------
*/

const extractAgeLimit = (text) => {
  if (!text) {
    return "";
  }

  const patterns = [
    /(?:maximum|upper)\s+age\s*(?:limit)?\s*(?:is)?\s*[:\-]?\s*(\d+)\s*years?/i,

    /age\s*(?:limit)?\s*[:\-]?\s*(?:maximum|up\s*to)?\s*(\d+)\s*years?/i,

    /(\d+)\s*years?\s*(?:of\s*)?age/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return `Maximum ${match[1]} years`;
    }
  }

  return "";
};

/*
|--------------------------------------------------------------------------
| Extract Interview Date
|--------------------------------------------------------------------------
*/

const extractInterviewDate = (text) => {
  if (!text) {
    return null;
  }

  const patterns = [
    /(?:walk[-\s]?in\s+interview|interview)\s*(?:on|date)?\s*[:\-]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,

    /(?:walk[-\s]?in\s+interview|interview)[^\d]{0,100}(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return convertDate(match[1]);
    }
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Extract Application Dates
|--------------------------------------------------------------------------
*/

const extractApplicationDates = (bodyText, pdfText) => {
  const combinedText = `${bodyText}\n${pdfText}`;

  let startDate =
    extractDateFromText(combinedText, "Start Date") ||
    extractDateFromText(combinedText, "Application Start Date") ||
    extractDateFromText(combinedText, "Opening Date") ||
    extractDateFromText(combinedText, "Published Date");

  let endDate =
    extractDateFromText(combinedText, "End Date") ||
    extractDateFromText(combinedText, "Application End Date") ||
    extractDateFromText(combinedText, "Closing Date") ||
    extractDateFromText(combinedText, "Last Date");

  /*
   * Some DRDO JRF notices don't explicitly use "Application Start Date"
   * and "Application End Date". In that case, use the dates appearing
   * in the notice.
   */

  if (!startDate || !endDate) {
    const dateMatches = combinedText.match(
      /\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}\b/g
    );

    if (dateMatches && dateMatches.length >= 2) {
      const parsedDates = dateMatches
        .map(convertDate)
        .filter(Boolean)
        .sort((a, b) => a - b);

      if (!startDate && parsedDates.length > 0) {
        startDate = parsedDates[0];
      }

      if (!endDate && parsedDates.length > 1) {
        endDate = parsedDates[parsedDates.length - 1];
      }
    }
  }

  return {
    startDate,
    endDate,
  };
};

/*
|--------------------------------------------------------------------------
| Build Job
|--------------------------------------------------------------------------
*/

const buildJob = ({
  notice,
  details,
  pdfText,
  pdfUrl,
}) => {
  const combinedText = `${details.bodyText}\n${pdfText}`;

  const advertisementNumber =
    extractAdvertisementNumber(combinedText);

  const {
    startDate,
    endDate,
  } = extractApplicationDates(
    details.bodyText,
    pdfText
  );

  const vacancies = extractVacancyCount(pdfText);

  const qualification = extractQualification(pdfText);

  const salary = extractSalary(pdfText);

  const ageLimit = extractAgeLimit(pdfText);

  const interviewDate = extractInterviewDate(pdfText);

  /*
   * Notification date:
   * Prefer the DRDO page published date.
   */

  const notificationDate =
    extractDateFromText(
      details.bodyText,
      "Published Date"
    ) || startDate;

  return {
    title: notice.title,

    organization:
      "Defence Research and Development Organisation",

    category: "Defence - Telangana",

    vacancies,

    qualification,

    location: "Hyderabad, Telangana",

    notificationDate,

    applicationStartDate: startDate,

    applicationEndDate: endDate,

    /*
     * For a walk-in interview, the interview date is effectively
     * the relevant examination/event date.
     */

    examDate: interviewDate || endDate,

    notificationUrl: pdfUrl,

    applyUrl: DRDO_VACANCIES_URL,

    source: "DRDO-Telangana",

    sourceId:
      advertisementNumber ||
      `DRDO-TELANGANA-${notice.title
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toUpperCase()}`,

    description:
      `Official DRDO Telangana defence opportunity. ${notice.title}.`,

    salary,

    ageLimit,

    isActive: true,
  };
};

/*
|--------------------------------------------------------------------------
| Check Whether Application Is Currently Open
|--------------------------------------------------------------------------
*/

const isCurrentlyOpen = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return true;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return today >= start && today <= end;
};

/*
|--------------------------------------------------------------------------
| Main Collector
|--------------------------------------------------------------------------
*/

const fetchTelanganaDefenceJobs = async () => {
  console.log(
    "\nStarting Telangana Defence job collection..."
  );

  const notices = await discoverTelanganaNotices();

  console.log(
    `Found ${notices.length} Telangana Defence notice(s).`
  );

  const savedJobs = [];

  for (const notice of notices) {
    console.log(`\nChecking: ${notice.title}`);

    try {
      const details = await getNoticeDetails(notice);

      if (!details.pdfUrl) {
        console.log(
          "No official PDF found. Skipping."
        );

        continue;
      }

      console.log(`PDF: ${details.pdfUrl}`);

      const pdfBuffer = await downloadPdf(
        details.pdfUrl
      );

      const pdfText = await extractPdfText(
        pdfBuffer
      );

      const job = buildJob({
        notice,
        details,
        pdfText,
        pdfUrl: details.pdfUrl,
      });

      console.log(
        `Advertisement: ${job.sourceId}`
      );

      console.log(
        `Application: ${
          job.applicationStartDate
            ? job.applicationStartDate
                .toISOString()
                .slice(0, 10)
            : "Unknown"
        } → ${
          job.applicationEndDate
            ? job.applicationEndDate
                .toISOString()
                .slice(0, 10)
            : "Unknown"
        }`
      );

      /*
       * If the application has already closed,
       * deactivate the existing record and don't show it.
       */

      if (
        job.applicationEndDate &&
        !isCurrentlyOpen(
          job.applicationStartDate,
          job.applicationEndDate
        )
      ) {
        await Job.findOneAndUpdate(
          {
            source: job.source,
            sourceId: job.sourceId,
          },
          {
            $set: {
              isActive: false,
            },
          }
        );

        console.log(
          "Application is not currently open. Skipping."
        );

        continue;
      }

      /*
       * Save or update the job.
       */

      const savedJob = await Job.findOneAndUpdate(
        {
          source: job.source,
          sourceId: job.sourceId,
        },
        {
          $set: job,
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      console.log(
        `Saved: ${savedJob.title}`
      );

      console.log(
        `Vacancies: ${savedJob.vacancies}`
      );

      console.log(
        `Location: ${savedJob.location}`
      );

      console.log(
        `Salary: ${
          savedJob.salary || "Not detected"
        }`
      );

      console.log(
        `Qualification: ${
          savedJob.qualification?.join(", ") ||
          "Not detected"
        }`
      );

      savedJobs.push(savedJob);
    } catch (error) {
      console.error(
        `Failed to process ${notice.title}:`,
        error.message
      );
    }
  }

  console.log(
    `\nTelangana Defence collection completed. Active jobs saved: ${savedJobs.length}`
  );

  return savedJobs;
};

/*
|--------------------------------------------------------------------------
| Standalone Execution
|--------------------------------------------------------------------------
*/

if (require.main === module) {
  (async () => {
    try {
      await connectDB();

      const jobs =
        await fetchTelanganaDefenceJobs();

      console.log(
        "\nFinal Telangana Defence jobs:"
      );

      console.log(
        JSON.stringify(jobs, null, 2)
      );

      process.exit(0);
    } catch (error) {
      console.error(
        "\nTelangana Defence collection failed:",
        error.message
      );

      process.exit(1);
    }
  })();
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = fetchTelanganaDefenceJobs;