const { chromium } = require("playwright");
const { PDFParse } = require("pdf-parse");

const connectDB = require("../../config/db");
const Job = require("../../models/Job");

const DRDO_VACANCIES_URL =
  "https://drdo.gov.in/drdo/offerings/vacancies";

// --------------------------------------------------
// DATE HELPERS
// --------------------------------------------------

const parseDate = (dateString) => {
  if (!dateString) return null;

  const match = dateString.match(
    /(\d{2})\/(\d{2})\/(\d{4})/
  );

  if (!match) return null;

  const [, day, month, year] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );
};

const isApplicationCurrentlyOpen = (
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

  return today >= start && today <= end;
};

// --------------------------------------------------
// NOTICE FILTER
// --------------------------------------------------

const isRelevantDRDONotice = (notice) => {
  const title = (notice.title || "").toLowerCase();

  // Ignore result / selection notices
  if (
    title.includes("result") ||
    title.includes("selected candidates") ||
    title.includes("provisionally selected") ||
    title.includes("waitlisted candidates") ||
    title.includes("appointment to the post")
  ) {
    return false;
  }

  return true;
};

// --------------------------------------------------
// PDF TEXT EXTRACTION
// --------------------------------------------------

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

// --------------------------------------------------
// VACANCY EXTRACTION
// --------------------------------------------------

const extractVacancyCount = (text) => {
  if (!text) return null;

  const cleanText = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ");

  const patterns = [
    // No. of vacancies: 5
    /(?:no\.?\s*of|number\s*of|no\s*of)\s*(?:the\s*)?(?:posts?|vacancies?|positions?)\s*[:\-]?\s*(\d+)/i,

    // Vacancies: 5
    /(?:vacancies?|posts?|positions?)\s*[:\-]\s*(\d+)/i,

    // 5 vacancies / 5 posts
    /\b(\d+)\s+(?:vacancies?|posts?|positions?)\b/i,

    // Total vacancies: 5
    /total\s*(?:number\s*of\s*)?(?:vacancies?|posts?|positions?)\s*[:\-]?\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      const number = Number(match[1]);

      if (
        Number.isInteger(number) &&
        number > 0
      ) {
        return number;
      }
    }
  }

  // Some DRDO PDFs contain the vacancy heading
  // and number on nearby lines.
  const lines = cleanText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      /vacanc|no\.?\s*of\s*posts?|number\s*of\s*posts?/i.test(
        line
      )
    ) {
      const nearbyText = lines
        .slice(i, i + 3)
        .join(" ");

      const numberMatch =
        nearbyText.match(/\b(\d{1,4})\b/);

      if (numberMatch) {
        const number = Number(
          numberMatch[1]
        );

        if (
          number > 0 &&
          number < 10000
        ) {
          return number;
        }
      }
    }
  }

  return null;
};

// --------------------------------------------------
// AGE LIMIT EXTRACTION
// --------------------------------------------------

const extractAgeLimit = (text) => {
  if (!text) return "";

  const cleanText = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ");

  const patterns = [
    /age\s*limit\s*[:\-]?\s*([^\n.]{5,250})/i,

    /maximum\s*age\s*[:\-]?\s*([^\n.]{5,250})/i,

    /upper\s*age\s*limit\s*[:\-]?\s*([^\n.]{5,250})/i,

    /age\s*[:\-]?\s*(?:not\s*more\s*than\s*)?(\d+\s*years?[^\n.]*)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      return match[1]
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  return "";
};

// --------------------------------------------------
// SALARY / STIPEND / EMOLUMENTS EXTRACTION
// --------------------------------------------------

const extractSalary = (text) => {
  if (!text) return "";

  const cleanText = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ");

  const patterns = [
    /(?:monthly\s*)?emoluments?\s*[:\-]?\s*([^\n.]{5,300})/i,

    /stipend\s*[:\-]?\s*([^\n.]{5,300})/i,

    /salary\s*[:\-]?\s*([^\n.]{5,300})/i,

    /pay\s*(?:scale|level)?\s*[:\-]?\s*([^\n.]{5,300})/i,

    /remuneration\s*[:\-]?\s*([^\n.]{5,300})/i,

    /Rs\.?\s*[\d,]+(?:\/-)?\s*(?:per\s*month|pm|monthly)?/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      const value =
        match[1] || match[0];

      return value
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  return "";
};

// --------------------------------------------------
// FETCH PDF
// --------------------------------------------------

const fetchPdf = async (
  request,
  pdfUrl
) => {
  const response = await request.get(
    pdfUrl
  );

  if (!response.ok()) {
    throw new Error(
      `PDF request failed: ${response.status()}`
    );
  }

  return await response.body();
};

// --------------------------------------------------
// FIND PDF ON DETAIL PAGE
// --------------------------------------------------

const getDetailPdfUrl = async (
  page,
  detailUrl
) => {
  try {
    await page.goto(detailUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const pdfUrl = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll("a")
      );

      const candidates = links
        .map((link) => ({
          href: link.href,
          text: (
            link.innerText || ""
          )
            .trim()
            .toLowerCase(),
        }))
        .filter(
          (item) => item.href
        );

      // Prefer advertisement /
      // application / notification PDFs.
      const preferred =
        candidates.find((item) => {
          return (
            item.href
              .toLowerCase()
              .includes(".pdf") &&
            (
              item.text.includes(
                "advertisement"
              ) ||
              item.text.includes(
                "application"
              ) ||
              item.text.includes(
                "notification"
              )
            )
          );
        });

      if (preferred) {
        return preferred.href;
      }

      // Otherwise use any PDF.
      const anyPdf =
        candidates.find((item) =>
          item.href
            .toLowerCase()
            .includes(".pdf")
        );

      return anyPdf
        ? anyPdf.href
        : null;
    });

    return pdfUrl;
  } catch (error) {
    console.error(
      "Could not find detail PDF:",
      error.message
    );

    return null;
  }
};

// --------------------------------------------------
// PROCESS ONE DRDO NOTICE
// --------------------------------------------------

const processDRDONotice = async (
  notice,
  browserPage,
  request
) => {
  console.log(
    "\n----------------------------------------"
  );

  console.log(
    "PROCESSING DRDO NOTICE"
  );

  console.log(
    "----------------------------------------"
  );

  console.log(
    "Title:",
    notice.title
  );

  console.log(
    "Advertisement No:",
    notice.advertisementNo
  );

  console.log(
    "Published:",
    notice.publishedDate
  );

  console.log(
    "Start:",
    notice.startDate
  );

  console.log(
    "End:",
    notice.endDate
  );

  console.log(
    "Detail URL:",
    notice.detailUrl
  );

  const startDate =
    parseDate(
      notice.startDate
    );

  const endDate =
    parseDate(
      notice.endDate
    );

  const publishedDate =
    parseDate(
      notice.publishedDate
    );

  if (
    !isApplicationCurrentlyOpen(
      startDate,
      endDate
    )
  ) {
    console.log(
      "Application is not currently open. Skipping."
    );

    return null;
  }

  console.log(
    "Application is currently OPEN."
  );

  if (!notice.detailUrl) {
    console.log(
      "No detail URL found. Skipping."
    );

    return null;
  }

  // --------------------------------------------------
  // FIND OFFICIAL PDF
  // --------------------------------------------------

  const pdfUrl =
    await getDetailPdfUrl(
      browserPage,
      notice.detailUrl
    );

  console.log(
    "PDF URL:",
    pdfUrl || "Not found"
  );

  let pdfText = "";

  // --------------------------------------------------
  // DOWNLOAD + PARSE PDF
  // --------------------------------------------------

  if (pdfUrl) {
    try {
      const pdfBuffer =
        await fetchPdf(
          request,
          pdfUrl
        );

      pdfText =
        await extractPdfText(
          pdfBuffer
        );

      console.log(
        "PDF text length:",
        pdfText.length
      );
    } catch (error) {
      console.log(
        "PDF extraction failed:",
        error.message
      );
    }
  }

  // --------------------------------------------------
  // EXTRACT JOB DATA
  // --------------------------------------------------

  const vacancies =
    extractVacancyCount(
      pdfText
    );

  const ageLimit =
    extractAgeLimit(
      pdfText
    );

  const salary =
    extractSalary(
      pdfText
    );

  console.log(
    "Extracted vacancies:",
    vacancies
  );

  console.log(
    "Extracted age limit:",
    ageLimit || "Not found"
  );

  console.log(
    "Extracted salary:",
    salary || "Not found"
  );

  // --------------------------------------------------
  // BUILD JOB
  // --------------------------------------------------

  const job = {
    title: notice.title,

    organization:
      "Defence Research and Development Organisation",

    category: "Defence",

    vacancies,

    qualification: [],

    location: "India",

    notificationDate:
      publishedDate,

    applicationStartDate:
      startDate,

    applicationEndDate:
      endDate,

    examDate: null,

    notificationUrl:
      pdfUrl ||
      notice.detailUrl,

    applyUrl:
      notice.detailUrl,

    source: "DRDO",

    sourceId:
      notice.advertisementNo,

    description:
      notice.title,

    salary,

    ageLimit,

    isActive: true,
  };

  // --------------------------------------------------
  // SAVE / UPDATE MONGODB
  // --------------------------------------------------

  const savedJob =
    await Job.findOneAndUpdate(
      {
        source: "DRDO",
        sourceId:
          notice.advertisementNo,
      },
      job,
      {
        upsert: true,
        returnDocument: "after",
      }
    );

  console.log(
    "DRDO job saved successfully."
  );

  console.log(
    "MongoDB Job ID:",
    savedJob._id
  );

  return savedJob;
};

// --------------------------------------------------
// MAIN DRDO COLLECTOR
// --------------------------------------------------

const fetchDRDOJobs = async () => {
  let browser;

  try {
    console.log(
      "\n========================================"
    );

    console.log(
      "STARTING DRDO JOB COLLECTION"
    );

    console.log(
      "========================================"
    );

    await connectDB();

    browser =
      await chromium.launch({
        headless: true,
      });

    const context =
      await browser.newContext();

    const page =
      await context.newPage();

    const request =
      context.request;

    console.log(
      "\nOpening DRDO vacancies page..."
    );

    await page.goto(
      DRDO_VACANCIES_URL,
      {
        waitUntil:
          "domcontentloaded",
        timeout: 60000,
      }
    );

    console.log(
      "DRDO vacancies page opened."
    );

    // --------------------------------------------------
    // EXTRACT NOTICE CARDS
    // --------------------------------------------------

    const notices =
      await page.evaluate(() => {
        const links =
          Array.from(
            document.querySelectorAll(
              "a"
            )
          );

        const viewMoreLinks =
          links.filter((link) => {
            const text =
              (
                link.innerText ||
                ""
              )
                .trim()
                .replace(
                  /\s+/g,
                  " "
                )
                .toLowerCase();

            return (
              text === "view more"
            );
          });

        const results = [];

        for (
          const link
          of viewMoreLinks
        ) {
          let element = link;

          let bestContainer =
            null;

          // Walk up the DOM tree.
          for (
            let level = 0;
            level < 20;
            level++
          ) {
            if (!element) {
              break;
            }

            const text =
              (
                element.innerText ||
                ""
              )
                .replace(
                  /\s+/g,
                  " "
                )
                .trim();

            const hasAdvertisementLabel =
              /Advertisement No/i.test(
                text
              );

            const hasPublishedLabel =
              /Published Date/i.test(
                text
              );

            const hasStartLabel =
              /Start Date/i.test(
                text
              );

            const hasEndLabel =
              /End Date/i.test(
                text
              );

            if (
              hasAdvertisementLabel &&
              hasPublishedLabel &&
              hasStartLabel &&
              hasEndLabel
            ) {
              bestContainer =
                element;

              break;
            }

            element =
              element.parentElement;
          }

          if (!bestContainer) {
            continue;
          }

          const rawText =
            (
              bestContainer.innerText ||
              ""
            )
              .replace(
                /\r/g,
                ""
              )
              .trim();

          const lines =
            rawText
              .split("\n")
              .map(
                (line) =>
                  line
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .trim()
              )
              .filter(Boolean);

          const advertisementIndex =
            lines.findIndex(
              (line) =>
                /^Advertisement No$/i.test(
                  line
                )
            );

          const publishedIndex =
            lines.findIndex(
              (line) =>
                /^Published Date$/i.test(
                  line
                )
            );

          const startIndex =
            lines.findIndex(
              (line) =>
                /^Start Date$/i.test(
                  line
                )
            );

          const endIndex =
            lines.findIndex(
              (line) =>
                /^End Date$/i.test(
                  line
                )
            );

          const advertisementNo =
            advertisementIndex !==
            -1
              ? lines[
                  advertisementIndex +
                    1
                ] || ""
              : "";

          const publishedDate =
            publishedIndex !==
            -1
              ? lines[
                  publishedIndex +
                    1
                ] || ""
              : "";

          const startDate =
            startIndex !== -1
              ? lines[
                  startIndex + 1
                ] || ""
              : "";

          const endDate =
            endIndex !== -1
              ? lines[
                  endIndex + 1
                ] || ""
              : "";

          // Title normally appears
          // before Advertisement No.
          let title = "";

          if (
            advertisementIndex >
            0
          ) {
            const possibleTitleLines =
              lines.slice(
                0,
                advertisementIndex
              );

            title =
              possibleTitleLines
                .filter(
                  (line) =>
                    line.length >
                      10 &&
                    !/^View More$/i.test(
                      line
                    )
                )
                .sort(
                  (a, b) =>
                    b.length -
                    a.length
                )[0] || "";
          }

          results.push({
            title,
            advertisementNo,
            publishedDate,
            startDate,
            endDate,
            detailUrl:
              link.href,
          });
        }

        return results;
      });

    const safeNotices =
      Array.isArray(notices)
        ? notices
        : [];

    // --------------------------------------------------
    // REMOVE DUPLICATES
    // --------------------------------------------------

    const uniqueNotices =
      Array.from(
        new Map(
          safeNotices.map(
            (notice) => [
              notice.advertisementNo ||
                notice.detailUrl,
              notice,
            ]
          )
        ).values()
      );

    console.log(
      `DRDO notice candidates found: ${uniqueNotices.length}`
    );

    // --------------------------------------------------
    // DISPLAY DISCOVERED NOTICES
    // --------------------------------------------------

    console.log(
      "\nFOUND DRDO NOTICES:"
    );

    uniqueNotices.forEach(
      (notice, index) => {
        console.log(
          `\n${index + 1}. ${notice.title}`
        );

        console.log(
          "Advertisement No:",
          notice.advertisementNo
        );

        console.log(
          "Published:",
          notice.publishedDate
        );

        console.log(
          "Start:",
          notice.startDate
        );

        console.log(
          "End:",
          notice.endDate
        );
      }
    );

    // --------------------------------------------------
    // PROCESS NOTICES
    // --------------------------------------------------

    const savedJobs = [];

    for (
      let i = 0;
      i < uniqueNotices.length;
      i++
    ) {
      const notice =
        uniqueNotices[i];

      console.log(
        `\nProcessing ${i + 1}/${uniqueNotices.length}`
      );

      if (
        !isRelevantDRDONotice(
          notice
        )
      ) {
        console.log(
          "Notice is not a recruitment/application notice. Skipping."
        );

        continue;
      }

      try {
        const savedJob =
          await processDRDONotice(
            notice,
            page,
            request
          );

        if (savedJob) {
          savedJobs.push(
            savedJob
          );
        }
      } catch (error) {
        console.error(
          "Failed processing DRDO notice:",
          error.message
        );
      }
    }

    await browser.close();

    console.log(
      "\n========================================"
    );

    console.log(
      "DRDO JOB COLLECTION COMPLETE"
    );

    console.log(
      "========================================"
    );

    return savedJobs;
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    console.error(
      "\nUnexpected DRDO collection error:",
      error.message
    );

    throw error;
  }
};

// --------------------------------------------------
// STANDALONE EXECUTION
// --------------------------------------------------

if (require.main === module) {
  fetchDRDOJobs()
    .then((jobs) => {
      console.log(
        `\nDRDO jobs saved: ${jobs.length}`
      );

      console.log(
        "\nDRDO collection process finished."
      );
    })
    .catch((error) => {
      console.error(
        "\nDRDO collection failed:",
        error.message
      );

      process.exitCode = 1;
    });
}

module.exports = fetchDRDOJobs;