const axios = require("axios");
const cheerio = require("cheerio");
const { PDFParse } = require("pdf-parse");

const Exam = require("../../models/Exam");
const connectDB = require("../../config/db");

// ============================================================
// OFFICIAL SSC SOURCES
// ============================================================

const SSC_HOME_URL = "https://ssc.gov.in/";

const SSC_NOTICE_API_URL =
  "https://ssc.gov.in/api/general-website/portal/notice-boards";

const SSC_CALENDAR_URL =
  "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf";

// ============================================================
// SSC EXAM DEFINITIONS
// ============================================================

const SSC_EXAMS = [
  {
    name: "Combined Graduate Level Examination, 2026",
    sourceId: "SSC-CGL-2026",
  },
  {
    name: "Junior Engineer (Civil, Mechanical & Electrical) Examination, 2026",
    sourceId: "SSC-JE-2026",
  },
  {
    name: "Selection Post Examination, Phase-XIV, 2026",
    sourceId: "SSC-SELECTION-POST-PHASE-XIV-2026",
  },
  {
    name: "Combined Higher Secondary (10+2) Level Examination, 2026",
    sourceId: "SSC-CHSL-2026",
  },
  {
    name: "Stenographer Grade 'C' & 'D' Examination, 2026",
    sourceId: "SSC-STENOGRAPHER-2026",
  },
  {
    name: "Combined Hindi Translators Examination, 2026",
    sourceId: "SSC-HINDI-TRANSLATORS-2026",
  },
  {
    name:
      "Multi-Tasking (Non-Technical) Staff & Havaldar (CBIC & CBN) Examination, 2026",
    sourceId: "SSC-MTS-HAVALDAR-2026",
  },
  {
    name:
      "Sub-Inspector in Delhi Police & Central Armed Police Forces Examination, 2026",
    sourceId: "SSC-SI-DELHI-POLICE-CAPF-2026",
  },
  {
    name:
      "Constables (GD) in Central Armed Police Forces (CAPFs), NIA, SSF and Rifleman (GD) in Assam Rifles Examination, 2027",
    sourceId: "SSC-GD-2027",
  },
];

// ============================================================
// FALLBACK DATA
// ============================================================

const SSC_CALENDAR_DATA = {
  "SSC-CGL-2026": {
    applicationStartDate: new Date(2026, 2, 31),
    applicationEndDate: new Date(2026, 3, 30),
    examSchedule: "May - June 2026",
  },

  "SSC-JE-2026": {
    applicationStartDate: new Date(2026, 2, 31),
    applicationEndDate: new Date(2026, 3, 30),
    examSchedule: "May - June 2026",
  },

  "SSC-SELECTION-POST-PHASE-XIV-2026": {
    applicationStartDate: new Date(2026, 2, 31),
    applicationEndDate: new Date(2026, 3, 30),
    examSchedule: "May - July 2026",
  },

  "SSC-CHSL-2026": {
    applicationStartDate: new Date(2026, 3, 30),
    applicationEndDate: new Date(2026, 4, 31),
    examSchedule: "July - September 2026",
  },

  "SSC-STENOGRAPHER-2026": {
    applicationStartDate: new Date(2026, 3, 30),
    applicationEndDate: new Date(2026, 4, 31),
    examSchedule: "August - September 2026",
  },

  "SSC-HINDI-TRANSLATORS-2026": {
    applicationStartDate: new Date(2026, 3, 30),
    applicationEndDate: new Date(2026, 4, 31),
    examSchedule: "August - September 2026",
  },

  "SSC-MTS-HAVALDAR-2026": {
    applicationStartDate: new Date(2026, 5, 30),
    applicationEndDate: new Date(2026, 6, 31),
    examSchedule: "September - November 2026",
  },

  "SSC-SI-DELHI-POLICE-CAPF-2026": {
    applicationStartDate: new Date(2026, 4, 31),
    applicationEndDate: new Date(2026, 5, 30),
    examSchedule: "October - November 2026",
  },

  "SSC-GD-2027": {
    applicationStartDate: new Date(2026, 8, 30),
    applicationEndDate: new Date(2026, 9, 31),
    examSchedule: "January - March 2027",
  },
};

// ============================================================
// AXIOS HEADERS
// ============================================================

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0 Safari/537.36",

  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7",
};

// ============================================================
// TEXT CLEANER
// ============================================================

const cleanText = (text) => {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
};

// ============================================================
// EXAM NAME NORMALIZER
// ============================================================

const normalizeExamName = (text) => {
  return cleanText(text)
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

// ============================================================
// CHECK WHETHER NOTICE BELONGS TO EXAM
// ============================================================

const noticeMatchesExam = (noticeText, exam) => {
  const normalizedNotice = normalizeExamName(noticeText || "");
  const normalizedExam = normalizeExamName(exam.name || "");

  // ----------------------------------------------------------
  // 1. Examination year must match.
  // ----------------------------------------------------------

  const examYearMatch = normalizedExam.match(/\b(20\d{2})\b/);

  if (examYearMatch) {
    const examYear = examYearMatch[1];

    if (!normalizedNotice.includes(examYear)) {
      return false;
    }
  }

  // ----------------------------------------------------------
  // 2. Examination-specific keywords.
  // ----------------------------------------------------------

  const examSpecificKeywords = {
    "SSC-CGL-2026": [
      "combined graduate level",
    ],

    "SSC-JE-2026": [
      "junior engineer",
    ],

    "SSC-SELECTION-POST-PHASE-XIV-2026": [
      "selection posts",
      "phase xiv",
    ],

    "SSC-CHSL-2026": [
      "combined higher secondary",
      "chsl",
    ],

    "SSC-STENOGRAPHER-2026": [
      "stenographer grade c",
      "stenographer grade d",
      "stenographer grade c and d",
    ],

    "SSC-HINDI-TRANSLATORS-2026": [
      "combined hindi translators",
      "hindi translators",
      "junior hindi translator",
    ],

    "SSC-MTS-HAVALDAR-2026": [
      "multi tasking",
      "multitasking",
      "mts",
      "havaldar",
      "multi tasking non technical",
      "multi tasking non technical staff",
      "multi tasking non technical staff and havaldar",
      "multi tasking non technical staff havaldar",
    ],

    "SSC-SI-DELHI-POLICE-CAPF-2026": [
      "sub inspector in delhi police",
      "sub inspector in delhi police and central armed police forces",
      "delhi police and central armed police forces",
    ],

    "SSC-GD-2027": [
      "constable gd",
      "constables gd",
      "rifleman gd",
      "constable gd in central armed police forces",
      "rifleman gd in assam rifles",
    ],
  };

  const keywords = examSpecificKeywords[exam.sourceId];

  // ----------------------------------------------------------
  // 3. Require specific keyword for configured exams.
  // ----------------------------------------------------------

  if (keywords) {
    const hasSpecificKeyword = keywords.some((keyword) =>
      normalizedNotice.includes(normalizeExamName(keyword))
    );

    if (!hasSpecificKeyword) {
      return false;
    }

    // --------------------------------------------------------
    // MTS/Havaldar additional protection.
    // --------------------------------------------------------

    if (exam.sourceId === "SSC-MTS-HAVALDAR-2026") {
      const hasMTSKeyword =
        normalizedNotice.includes("multi tasking") ||
        normalizedNotice.includes("multitasking") ||
        normalizedNotice.includes("mts") ||
        normalizedNotice.includes("havaldar");

      if (!hasMTSKeyword) {
        return false;
      }

      return normalizedNotice.includes("2026");
    }

    return true;
  }

  // ----------------------------------------------------------
  // 4. Generic fallback for future SSC examinations.
  // ----------------------------------------------------------

  const importantWords = normalizedExam
    .split(" ")
    .filter(
      (word) =>
        word.length >= 4 &&
        ![
          "examination",
          "exam",
          "level",
          "central",
          "forces",
          "staff",
          "2026",
          "2027",
        ].includes(word)
    );

  if (importantWords.length === 0) {
    return false;
  }

  let matchedWords = 0;

  for (const word of importantWords) {
    if (normalizedNotice.includes(word)) {
      matchedWords++;
    }
  }

  const matchRatio = matchedWords / importantWords.length;

  return matchRatio >= 0.60;
};

// ============================================================
// PARSE SINGLE DATE
// ============================================================

const parseDate = (dateString) => {
  if (!dateString) {
    return null;
  }

  const cleaned = cleanText(dateString);

  let match = cleaned.match(
    /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/
  );

  if (!match) {
    match = cleaned.match(
      /(\d{1,2})\s*[-\/]\s*(\d{1,2})\s*[-\/]\s*(\d{4})/
    );
  }

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

// ============================================================
// PARSE DATE RANGE
// ============================================================

const parseDateRange = (text) => {
  if (!text) {
    return null;
  }

  const cleaned = cleanText(text);

  const rangeMatch = cleaned.match(
    /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\s*(?:to|-|–|—)\s*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/i
  );

  if (!rangeMatch) {
    return null;
  }

  const startDate = parseDate(
    `${rangeMatch[1]}-${rangeMatch[2]}-${rangeMatch[3]}`
  );

  const endDate = parseDate(
    `${rangeMatch[4]}-${rangeMatch[5]}-${rangeMatch[6]}`
  );

  if (!startDate || !endDate) {
    return null;
  }

  return {
    startDate,
    endDate,
  };
};

// ============================================================
// PARSE MONTH/YEAR
// ============================================================

const parseMonthYear = (text) => {
  if (!text) {
    return null;
  }

  const match = cleanText(text).match(
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)[\s-]+\d{4}/i
  );

  return match ? match[0] : null;
};

// ============================================================
// FIND APPLICATION DATES IN NOTICE
// ============================================================

const extractApplicationDates = (text) => {
  const clean = cleanText(text);

  let applicationStartDate = null;
  let applicationEndDate = null;

  // ----------------------------------------------------------
  // Dates for submission of online applications
  // ----------------------------------------------------------

  const rangePatterns = [
    /Dates for submission of online applications.*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*(?:to|-|–|—)\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /online applications.*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*(?:to|-|–|—)\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /application.*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*(?:to|-|–|—)\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
  ];

  for (const pattern of rangePatterns) {
    const match = clean.match(pattern);

    if (match) {
      applicationStartDate = parseDate(match[1]);
      applicationEndDate = parseDate(match[2]);

      if (applicationStartDate && applicationEndDate) {
        break;
      }
    }
  }

  // ----------------------------------------------------------
  // Fallback: Last date for receipt of applications
  // ----------------------------------------------------------

  if (!applicationEndDate) {
    const lastDateMatch = clean.match(
      /last date.*?(?:receipt|submission).*?applications?.*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i
    );

    if (lastDateMatch) {
      applicationEndDate = parseDate(lastDateMatch[1]);
    }
  }

  return {
    applicationStartDate,
    applicationEndDate,
  };
};

// ============================================================
// FIND EXAMINATION SCHEDULE
// ============================================================

const extractExamSchedule = (text) => {
  const clean = cleanText(text);

  const patterns = [
    /Tentative Schedule of (?:Tier[- ]?I|Tier[- ]?II).*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /Tentative Schedule.*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /Date of Examination.*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /Date[s]?\s+of\s+(?:Tier[- ]?I|Tier[- ]?II).*?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);

    if (match) {
      const date = parseDate(match[1]);

      if (date) {
        return {
          examDate: date,
          examSchedule: null,
        };
      }
    }
  }

  // ----------------------------------------------------------
  // Month/year schedule
  // ----------------------------------------------------------

  const monthYearMatch = clean.match(
    /(?:Tentative Schedule|Date of Examination).*?((?:January|February|March|April|May|June|July|August|September|October|November|December)[a-zA-Z\s,\-–—]*\d{4})/i
  );

  if (monthYearMatch) {
    return {
      examDate: null,
      examSchedule: cleanText(monthYearMatch[1]),
    };
  }

  return {
    examDate: null,
    examSchedule: null,
  };
};

// ============================================================
// DOWNLOAD PDF
// ============================================================

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const downloadPdf = async (pdfUrl) => {
  const maxAttempts = 3;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Downloading SSC PDF (attempt ${attempt}/${maxAttempts})...`
      );

      const response = await axios.get(pdfUrl, {
        responseType: "arraybuffer",
        timeout: 60000,

        headers: {
          ...REQUEST_HEADERS,
          Referer: SSC_HOME_URL,
          Connection: "close",
        },

        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,

        validateStatus: (status) => status >= 200 && status < 300,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("SSC PDF response was empty.");
      }

      return Buffer.from(response.data);
    } catch (error) {
      lastError = error;

      console.log(
        `SSC PDF download attempt ${attempt} failed: ${
          error.code || error.message
        }`
      );

      if (attempt < maxAttempts) {
        await sleep(attempt * 2000);
      }
    }
  }

  throw lastError;
};

// ============================================================
// EXTRACT PDF TEXT
// ============================================================

const extractPdfText = async (pdfBuffer) => {
  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const data = await parser.getText();

    return cleanText(data.text || "");
  } finally {
    await parser.destroy();
  }
};

// ============================================================
// FIND OFFICIAL EXAMINATION NOTICES
// ============================================================

const discoverOfficialNotices = async () => {
  console.log(
    "\nDiscovering official SSC examination notices through the official API..."
  );

  const allNotices = [];

  try {
    let currentPage = 1;
    let totalPages = 1;

    do {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        contentType: "notice-boards",
        key: "createdAt",
        order: "DESC",
        isPaginationRequired: "true",
        isAttachment: "true",
        language: "english",
        attributes:
          "id,headline,examId,contentType,redirectUrl,startDate,endDate,language,createdAt",
      });

      console.log(
        `Fetching SSC notice page ${currentPage}/${totalPages}...`
      );

      const response = await axios.get(
        `${SSC_NOTICE_API_URL}?${params.toString()}`,
        {
          timeout: 60000,

          headers: {
            ...REQUEST_HEADERS,
            Accept: "application/json, text/plain, */*",
            Referer: SSC_HOME_URL,
          },
        }
      );

      const responseData = response.data;

      if (
        !responseData ||
        !Array.isArray(responseData.data)
      ) {
        console.log(
          `SSC notice page ${currentPage} returned no valid data.`
        );

        break;
      }

      for (const notice of responseData.data) {
        if (
          !notice ||
          !notice.headline ||
          !Array.isArray(notice.attachments)
        ) {
          continue;
        }

        for (const attachment of notice.attachments) {
          if (!attachment || !attachment.path) {
            continue;
          }

          const fileName = cleanText(
            attachment.fileName || ""
          );

          const attachmentType = cleanText(
            attachment.type || ""
          ).toLowerCase();

          const attachmentPath = String(
            attachment.path
          ).replace(/\\/g, "/");

          const looksLikePdf =
            attachmentType.includes("application/pdf") ||
            fileName.toLowerCase().endsWith(".pdf") ||
            attachmentPath.toLowerCase().endsWith(".pdf");

          if (!looksLikePdf) {
            continue;
          }

          const pdfUrl = attachmentPath.startsWith("http")
            ? attachmentPath
            : `https://ssc.gov.in/api/attachment/${attachmentPath}`;

          allNotices.push({
            id: notice.id || attachment.id || null,

            title: cleanText(notice.headline),

            examId: notice.examId || null,

            url: pdfUrl,

            fileName,

            startDate: notice.startDate || null,

            endDate: notice.endDate || null,

            createdAt: notice.createdAt || null,
          });
        }
      }

      const pagination = responseData.paginate;

      if (pagination) {
        totalPages =
          Number(pagination.totalPage) || currentPage;
      } else {
        totalPages = currentPage;
      }

      currentPage++;

      if (currentPage <= totalPages) {
        await sleep(150);
      }
    } while (currentPage <= totalPages);

    const uniqueNotices = Array.from(
      new Map(
        allNotices.map((notice) => [
          notice.url,
          notice,
        ])
      ).values()
    );

    console.log(
      `Official SSC notice PDF links discovered: ${uniqueNotices.length}`
    );

    return uniqueNotices;
  } catch (error) {
    console.error(
      "Failed to discover official SSC examination notices:",
      error.message
    );

    return [];
  }
};

// ============================================================
// FIND NOTICE FOR A SPECIFIC EXAM
// ============================================================

const findOfficialNoticeForExam = async (
  exam,
  noticeLinks
) => {
  // ========================================================
  // Exam-specific preferred notice titles
  // ========================================================

  const preferredTitlePatterns = {
    "SSC-CGL-2026": [
      "notice of combined graduate level examination 2026",
      "notice of combined graduate level examination 2026",
    ],

    "SSC-JE-2026": [
      "notice of junior engineer civil mechanical and electrical examination 2026",
      "notice of junior engineer civil mechanical electrical examination 2026",
    ],

    "SSC-SELECTION-POST-PHASE-XIV-2026": [
      "notice for phase xiv 2026 selection posts",
      "notice for phase xiv 2026 selection post",
    ],

    "SSC-CHSL-2026": [
      "notice of combined higher secondary 10 2 level examination 2026",
      "notice of combined higher secondary level examination 2026",
    ],

    "SSC-STENOGRAPHER-2026": [
      "notice of stenographer grade c and d examination 2026",
      "notice of stenographer grade c d examination 2026",
    ],

    "SSC-HINDI-TRANSLATORS-2026": [
      "notice of combined hindi translators examination 2026",
      "notice of combined hindi translator examination 2026",
    ],

    "SSC-MTS-HAVALDAR-2026": [
      "notice of multi tasking non technical staff and havaldar cbic and cbn examination 2026",
      "notice of multi tasking non technical staff and havaldar cbic cbn examination 2026",
      "notice of multi tasking non technical staff havaldar examination 2026",
      "notice of multi tasking non technical staff examination 2026",
      "notice of mts havaldar examination 2026",
      "notice of mts examination 2026",
    ],

    "SSC-SI-DELHI-POLICE-CAPF-2026": [
      "notice of sub inspector in delhi police and central armed police forces examination 2026",
      "notice of sub inspector in delhi police central armed police forces examination 2026",
    ],

    "SSC-GD-2027": [
      "notice of constable gd in central armed police forces 2027",
      "notice of constables gd in central armed police forces 2027",
      "notice of constable gd",
      "notice of constables gd",
    ],
  };

  // ========================================================
  // Normalize helper
  // ========================================================

  const normalizeTitle = (text) => {
    return normalizeExamName(text || "");
  };

  // ========================================================
  // Get preferred titles
  // ========================================================

  const preferredPatterns =
    preferredTitlePatterns[exam.sourceId] || [];

  // ========================================================
  // Notice scoring
  // ========================================================

  const scoredNotices = [];

  for (const notice of noticeLinks) {
    const title = normalizeTitle(notice.title);

    // ------------------------------------------------------
    // First: notice must belong to this exam
    // ------------------------------------------------------

    if (
      !noticeMatchesExam(
        notice.title,
        exam
      )
    ) {
      continue;
    }

    let score = 0;

    // ------------------------------------------------------
    // Exact preferred title match
    // ------------------------------------------------------

    for (const preferredPattern of preferredPatterns) {
      const normalizedPattern =
        normalizeTitle(preferredPattern);

      if (title === normalizedPattern) {
        score += 100;
      } else if (title.includes(normalizedPattern)) {
        score += 80;
      }
    }

    // ------------------------------------------------------
    // Strong advertisement signals
    // ------------------------------------------------------

    if (title.includes("notice of adv")) {
      score += 40;
    }

    if (title.includes("advertisement")) {
      score += 40;
    }

    if (title.includes("notice of")) {
      score += 25;
    }

    if (title.includes("online application")) {
      score += 20;
    }

    if (title.includes("online applications")) {
      score += 20;
    }

    if (title.includes("recruitment")) {
      score += 15;
    }

    // ------------------------------------------------------
    // Exact year
    // ------------------------------------------------------

    const examYearMatch =
      exam.name.match(/\b(20\d{2})\b/);

    if (
      examYearMatch &&
      title.includes(examYearMatch[1])
    ) {
      score += 20;
    }

    // ------------------------------------------------------
    // Penalize unrelated notices
    // ------------------------------------------------------

    const negativeWords = [
      "answer key",
      "answer keys",
      "final answer",
      "result",
      "results",
      "tentative vacancy",
      "vacancies",
      "vacancy",
      "correction",
      "corrigendum",
      "withdrawal",
      "cancellation",
      "cancelled",
      "city intimation",
      "admit card",
      "admission certificate",
      "response sheet",
      "response sheets",
      "option cum preference",
      "option-cum-preference",
      "marks of candidates",
      "document verification",
      "skill test",
      "typing test",
      "self slot selection",
      "self-slot selection",
      "frta",
      "allocation",
      "revised dates",
      "reopening",
      "re-opening",
      "extension",
    ];

    for (const negativeWord of negativeWords) {
      if (
        title.includes(
          normalizeTitle(negativeWord)
        )
      ) {
        score -= 50;
      }
    }

    // ======================================================
    // SSC JE 2026 protection
    // ======================================================
    //
    // IMPORTANT:
    // Do not allow Scientific Assistant / IMD notices
    // to become the main Junior Engineer examination notice.
    //
    // The actual JE notice must clearly refer to:
    // Junior Engineer + Civil + Mechanical + Electrical.
    // ======================================================

    if (exam.sourceId === "SSC-JE-2026") {
      const isScientificAssistantNotice =
        title.includes("scientific assistant");

      const isIMDNotice =
        title.includes("india meteorological department") ||
        title.includes("meteorological department") ||
        title.includes("imd");

      if (isScientificAssistantNotice || isIMDNotice) {
        score -= 1000;
      }

      const hasJuniorEngineer =
        title.includes("junior engineer");

      const hasCivil =
        title.includes("civil");

      const hasMechanical =
        title.includes("mechanical");

      const hasElectrical =
        title.includes("electrical");

      const isActualJEAdvertisement =
        hasJuniorEngineer &&
        hasCivil &&
        hasMechanical &&
        hasElectrical &&
        !isScientificAssistantNotice &&
        !isIMDNotice;

      if (isActualJEAdvertisement) {
        score += 500;
      } else {
        score -= 500;
      }
    }

    // ======================================================
    // Selection Post protection
    // ======================================================

    if (
      exam.sourceId ===
      "SSC-SELECTION-POST-PHASE-XIV-2026"
    ) {
      if (title.includes("cancellation")) {
        score -= 150;
      }

      if (title.includes("addendum")) {
        score -= 100;
      }

      if (
        title.includes("phase xiv") &&
        title.includes("selection posts")
      ) {
        score += 100;
      }
    }

    // ======================================================
    // MTS/Havaldar protection
    // ======================================================

    if (
      exam.sourceId ===
      "SSC-MTS-HAVALDAR-2026"
    ) {
      if (
        title.includes("multi tasking") ||
        title.includes("multitasking")
      ) {
        score += 100;
      }

      if (title.includes("havaldar")) {
        score += 80;
      }

      // Prefer the main 2026 examination notice.
      if (
        title.includes("notice of") &&
        title.includes("2026")
      ) {
        score += 50;
      }

      // Do not select later-stage notices.
      if (
        title.includes("answer key") ||
        title.includes("result") ||
        title.includes("vacancy") ||
        title.includes("admit card") ||
        title.includes("response sheet") ||
        title.includes("correction") ||
        title.includes("city intimation")
      ) {
        score -= 150;
      }
    }

    // ======================================================
    // GD 2027 protection
    // ======================================================

    if (
      exam.sourceId ===
      "SSC-GD-2027"
    ) {
      if (
        title.includes("2026") &&
        !title.includes("2027")
      ) {
        score -= 100;
      }
    }

    scoredNotices.push({
      notice,
      score,
    });
  }

  // ========================================================
  // Sort by relevance
  // ========================================================

  scoredNotices.sort(
    (a, b) => b.score - a.score
  );

  // ========================================================
  // Inspect candidates
  //
  // Do not immediately accept the first title match.
  // Download PDF and verify application dates.
  // ========================================================

  for (const candidate of scoredNotices) {
    const notice = candidate.notice;

    try {
      console.log(
        `Checking SSC notice: ${notice.title}`
      );

      const pdfBuffer =
        await downloadPdf(notice.url);

      const text =
        await extractPdfText(pdfBuffer);

      const applicationDates =
        extractApplicationDates(text);

      // ----------------------------------------------------
      // Only accept a notice containing application
      // information.
      // ----------------------------------------------------

      if (
        applicationDates.applicationStartDate ||
        applicationDates.applicationEndDate
      ) {
        return {
          ...notice,
          extractedText: text,
        };
      }
    } catch (error) {
      console.log(
        `Could not inspect SSC notice: ${notice.url}`
      );
    }
  }

  // ========================================================
  // No suitable application notice found
  // ========================================================

  return null;
};

// ============================================================
// DOWNLOAD AND PARSE OFFICIAL CALENDAR
// ============================================================

const validateOfficialCalendar = async () => {
  try {
    const response = await axios.get(
      SSC_CALENDAR_URL,
      {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: REQUEST_HEADERS,
      }
    );

    const pdfBuffer =
      Buffer.from(response.data);

    const text =
      await extractPdfText(pdfBuffer);

    console.log(
      "Official SSC calendar PDF downloaded successfully."
    );

    console.log(
      `Extracted PDF text length: ${text.length}`
    );

    return text;
  } catch (error) {
    console.error(
      "Failed to download SSC calendar:",
      error.message
    );

    return "";
  }
};

// ============================================================
// BUILD EXAM FROM OFFICIAL NOTICE
// ============================================================

const buildExamFromNotice = async (
  exam,
  notice
) => {
  let text = notice.extractedText;

  if (!text) {
    const pdfBuffer =
      await downloadPdf(notice.url);

    text =
      await extractPdfText(pdfBuffer);
  }

  const applicationDates =
    extractApplicationDates(text);

  const examination =
    extractExamSchedule(text);

  if (
    !applicationDates.applicationStartDate &&
    !applicationDates.applicationEndDate
  ) {
    console.log(
      `Official notice found but application dates could not be extracted: ${exam.name}`
    );

    return null;
  }

  return {
    ...exam,

    applicationStartDate:
      applicationDates.applicationStartDate,

    applicationEndDate:
      applicationDates.applicationEndDate,

    examDate:
      examination.examDate,

    examSchedule:
      examination.examSchedule,

    notificationDate:
      applicationDates.applicationStartDate,

    notificationUrl:
      notice.url,

    sourceType:
      "official-notice",
  };
};

// ============================================================
// BUILD EXAM FROM CALENDAR FALLBACK
// ============================================================

const buildExamFromCalendar = (exam) => {
  const calendarData =
    SSC_CALENDAR_DATA[
      exam.sourceId
    ];

  if (!calendarData) {
    return null;
  }

  return {
    ...exam,

    applicationStartDate:
      calendarData.applicationStartDate,

    applicationEndDate:
      calendarData.applicationEndDate,

    examDate: null,

    examSchedule:
      calendarData.examSchedule,

    notificationDate:
      calendarData.applicationStartDate,

    notificationUrl:
      SSC_CALENDAR_URL,

    sourceType:
      "tentative-calendar",
  };
};

// ============================================================
// SAVE EXAM
// ============================================================

const saveExam = async (exam) => {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  let isActive = true;

  if (
    exam.applicationEndDate &&
    exam.applicationEndDate < today
  ) {
    isActive = false;
  }

  const descriptionParts = [
    `${exam.name} conducted by the Staff Selection Commission.`,
  ];

  if (exam.examSchedule) {
    descriptionParts.push(
      `Tentative examination schedule: ${exam.examSchedule}.`
    );
  }

  if (
    exam.sourceType ===
    "tentative-calendar"
  ) {
    descriptionParts.push(
      "Dates are based on the official SSC tentative examination calendar and may be revised by SSC."
    );
  }

  const examDocument = {
    name: exam.name,

    organization:
      "Staff Selection Commission",

    category:
      "SSC Examination",

    examDate:
      exam.examDate || null,

    applicationStartDate:
      exam.applicationStartDate || null,

    applicationEndDate:
      exam.applicationEndDate || null,

    notificationDate:
      exam.notificationDate || null,

    notificationUrl:
      exam.notificationUrl ||
      SSC_CALENDAR_URL,

    applyUrl:
      "https://ssc.gov.in/",

    description:
      descriptionParts.join(" "),

    source:
      "SSC",

    sourceId:
      exam.sourceId,

    isActive,
  };

  const savedExam =
    await Exam.findOneAndUpdate(
      {
        source: "SSC",

        sourceId:
          exam.sourceId,
      },

      examDocument,

      {
        upsert: true,
        returnDocument: "after",
      }
    );

  return {
    savedExam,
    isActive,
  };
};

// ============================================================
// MAIN SSC COLLECTION
// ============================================================

const fetchSSCExams = async () => {
  console.log(
    "\n========================================"
  );

  console.log(
    "SSC EXAM COLLECTION STARTED"
  );

  console.log(
    "========================================"
  );

  try {
    // ------------------------------------------------------
    // Validate official SSC calendar
    // ------------------------------------------------------

    const calendarText =
      await validateOfficialCalendar();

    if (!calendarText) {
      throw new Error(
        "Official SSC calendar could not be downloaded."
      );
    }

    // ------------------------------------------------------
    // Discover current official notices
    // ------------------------------------------------------

    const noticeLinks =
      await discoverOfficialNotices();

    let savedCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;
    let officialNoticeCount = 0;
    let calendarFallbackCount = 0;

    // ------------------------------------------------------
    // Process each SSC examination
    // ------------------------------------------------------

    for (const exam of SSC_EXAMS) {
      console.log(
        `\nChecking: ${exam.name}`
      );

      let examData = null;

      // ----------------------------------------------------
      // Try official examination notice first
      // ----------------------------------------------------

      if (noticeLinks.length > 0) {
        const officialNotice =
          await findOfficialNoticeForExam(
            exam,
            noticeLinks
          );

        if (officialNotice) {
          try {
            examData =
              await buildExamFromNotice(
                exam,
                officialNotice
              );

            if (examData) {
              officialNoticeCount++;

              console.log(
                `Official SSC notice found: ${officialNotice.url}`
              );
            }
          } catch (error) {
            console.log(
              `Official notice could not be parsed for ${exam.name}: ${error.message}`
            );
          }
        }
      }

      // ----------------------------------------------------
      // Fallback to official calendar
      // ----------------------------------------------------

      if (!examData) {
        examData =
          buildExamFromCalendar(
            exam
          );

        if (examData) {
          calendarFallbackCount++;

          console.log(
            "Using official SSC tentative calendar fallback."
          );
        }
      }

      if (!examData) {
        console.log(
          `Skipped: no SSC source data found for ${exam.name}`
        );

        continue;
      }

      // ----------------------------------------------------
      // Save
      // ----------------------------------------------------

      const result =
        await saveExam(examData);

      savedCount++;

      if (result.isActive) {
        activeCount++;

        console.log(
          `Active SSC exam: ${exam.name}`
        );
      } else {
        inactiveCount++;

        console.log(
          `Expired SSC exam marked inactive: ${exam.name}`
        );
      }
    }

    // ------------------------------------------------------
    // Complete
    // ------------------------------------------------------

    console.log(
      "\n========================================"
    );

    console.log(
      "SSC EXAM COLLECTION COMPLETE"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Saved/updated: ${savedCount}`
    );

    console.log(
      `Active: ${activeCount}`
    );

    console.log(
      `Inactive: ${inactiveCount}`
    );

    console.log(
      `Official notices used: ${officialNoticeCount}`
    );

    console.log(
      `Calendar fallbacks used: ${calendarFallbackCount}`
    );

    return {
      success: true,

      saved:
        savedCount,

      active:
        activeCount,

      inactive:
        inactiveCount,

      officialNotices:
        officialNoticeCount,

      calendarFallbacks:
        calendarFallbackCount,
    };
  } catch (error) {
    console.error(
      "SSC exam collection failed:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// STANDALONE EXECUTION
// ============================================================

if (
  require.main === module
) {
  connectDB()
    .then(() =>
      fetchSSCExams()
    )
    .then(() => {
      console.log(
        "\nSSC exam collection process finished."
      );

      process.exit(0);
    })
    .catch((error) => {
      console.error(
        "\nUnexpected SSC exam collection error:",
        error.message
      );

      process.exit(1);
    });
}

module.exports =
  fetchSSCExams;