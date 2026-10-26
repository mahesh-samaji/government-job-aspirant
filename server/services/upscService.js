const axios = require("axios");
const cheerio = require("cheerio");
const { PDFParse } = require("pdf-parse");

const Job = require("../models/Job");
const connectDB = require("../config/db");

// ========================================
// Convert written numbers into actual numbers
// ========================================
const wordsToNumber = (text) => {
  const words = text.toLowerCase().trim().split(/\s+/);

  const numbers = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
  };

  let total = 0;
  let current = 0;

  words.forEach((word) => {
    if (numbers[word]) {
      current += numbers[word];
    }

    if (word === "hundred") {
      current *= 100;
    }

    if (word === "thousand") {
      total += current * 1000;
      current = 0;
    }
  });

  return total + current;
};

// ========================================
// Extract application dates
// ========================================
const extractApplicationDates = (text) => {
  // Normalize PDF text
  const cleanText = text.replace(/\s+/g, " ").trim();

  // Find the complete UPSC application window
  const applicationWindowMatch = cleanText.match(
    /ONLINE RECRUITMENT APPLICATIONS ARE INVITED.*?FROM\s+(\d{2}-\d{2}-\d{4}).*?CLOSING DATE FOR SUBMISSION OF ONLINE RECRUITMENT APPLICATION.*?ON\s+(\d{2}-\d{2}-\d{4})/i
  );

  if (!applicationWindowMatch) {
    console.log(
      "UPSC application dates could not be detected."
    );

    return {
      applicationStartDate: null,
      applicationEndDate: null,
    };
  }

  const applicationStartDate =
    applicationWindowMatch[1];

  const applicationEndDate =
    applicationWindowMatch[2];

  console.log(
    "Detected UPSC application window:",
    applicationStartDate,
    "to",
    applicationEndDate
  );

  return {
    applicationStartDate,
    applicationEndDate,
  };
};

// ========================================
// Convert UPSC date DD-MM-YYYY to Date
// ========================================
//
// UPSC dates are Indian calendar dates.
//
// Start date:
// Beginning of the day in IST.
//
// End date:
// End of the day in IST.
//
// India uses UTC+05:30, so the stored MongoDB
// values will appear in UTC.
//
// Example:
//
// 01-10-2026
//
// becomes:
//
// 2026-10-01T18:29:59.999Z
//
// which represents:
//
// 02-10-2026 00:00:00 IST
// ========================================
const convertUPSCDate = (
  dateString,
  isEndDate = false
) => {
  if (!dateString) {
    return null;
  }

  const [day, month, year] =
    dateString.split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  if (isEndDate) {
    // End of the day in IST
    //
    // Date.UTC represents the date in UTC.
    // Subtract 5 hours 30 minutes to convert
    // Indian midnight/end-of-day correctly.
    //
    // 23:59:59.999 IST
    // = 18:29:59.999 UTC
    const utcDate = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        18,
        29,
        59,
        999
      )
    );

    return utcDate;
  }

  // Beginning of the day in IST
  //
  // 00:00:00 IST
  // = previous day 18:30:00 UTC
  const utcDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      18,
      30,
      0,
      0
    )
  );

  return utcDate;
};

// ========================================
// Check whether UPSC application is active
// ========================================
const isUPSCApplicationActive = (
  applicationStartDate,
  applicationEndDate
) => {
  if (
    !applicationStartDate ||
    !applicationEndDate
  ) {
    return false;
  }

  const now = new Date();

  return (
    now >= applicationStartDate &&
    now <= applicationEndDate
  );
};

// ========================================
// Find latest UPSC advertisement PDF
// ========================================
const findLatestUPSCAdvertisement = async () => {
  try {
    console.log(
      "Checking UPSC recruitment page..."
    );

    const recruitmentPage =
      "https://www.upsc.gov.in/recruitment/recruitment-advertisement";

    const response = await axios.get(
      recruitmentPage,
      {
        timeout: 30000,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
      }
    );

    const $ = cheerio.load(response.data);

    const advertisements = [];

    // ----------------------------------------
    // Check every link on the UPSC page
    // ----------------------------------------
    $("a").each((index, element) => {
      const linkText = $(element)
        .text()
        .replace(/\s+/g, " ")
        .trim();

      const href = $(element).attr("href");

      if (!href) {
        return;
      }

      const fullUrl = new URL(
        href,
        recruitmentPage
      ).href;

      // ----------------------------------------
      // Only consider PDF links
      // ----------------------------------------
      const isPdf =
        /\.pdf(\?.*)?$/i.test(fullUrl);

      if (!isPdf) {
        return;
      }

      // ----------------------------------------
      // Look for UPSC advertisement PDFs
      // ----------------------------------------
      const isAdvertisement =
        /AdvtNo-/i.test(fullUrl) ||
        /advertisement/i.test(linkText) ||
        /advt/i.test(linkText);

      if (!isAdvertisement) {
        return;
      }

      // ----------------------------------------
      // Extract advertisement number
      // Example:
      // AdvtNo-11-2026
      // ----------------------------------------
      const numberMatch =
        fullUrl.match(
          /AdvtNo-(\d+)-(\d{4})/i
        );

      if (!numberMatch) {
        return;
      }

      const advertisementNumber =
        Number(numberMatch[1]);

      const year =
        Number(numberMatch[2]);

      // ----------------------------------------
      // We only want 2026 advertisements
      // ----------------------------------------
      if (year !== 2026) {
        return;
      }

      // ----------------------------------------
      // Ignore special advertisements for now
      // ----------------------------------------
      const isSpecial =
        /special/i.test(fullUrl) ||
        /special/i.test(linkText);

      if (isSpecial) {
        return;
      }

      advertisements.push({
        advertisementNumber,
        year,
        title: linkText,
        url: fullUrl,
      });
    });

    // ----------------------------------------
    // Remove duplicate URLs
    // ----------------------------------------
    const uniqueAdvertisements = [];

    const seenUrls = new Set();

    advertisements.forEach(
      (advertisement) => {
        if (
          !seenUrls.has(
            advertisement.url
          )
        ) {
          seenUrls.add(
            advertisement.url
          );

          uniqueAdvertisements.push(
            advertisement
          );
        }
      }
    );

    // ----------------------------------------
    // Sort newest advertisement first
    // ----------------------------------------
    uniqueAdvertisements.sort(
      (a, b) =>
        b.advertisementNumber -
        a.advertisementNumber
    );

    if (
      uniqueAdvertisements.length === 0
    ) {
      console.log(
        "\nNo advertisement PDFs detected."
      );

      return null;
    }

    // ----------------------------------------
    // Display advertisements
    // ----------------------------------------
    console.log(
      "\nUPSC advertisements found:"
    );

    uniqueAdvertisements.forEach(
      (advertisement, index) => {
        console.log(
          `${index + 1}. Advertisement No. ${advertisement.advertisementNumber}-${advertisement.year}`
        );

        console.log(
          "   URL:",
          advertisement.url
        );
      }
    );

    // ----------------------------------------
    // Select latest advertisement
    // ----------------------------------------
    const latestAdvertisement =
      uniqueAdvertisements[0];

    console.log(
      "\nLatest UPSC advertisement:"
    );

    console.log(
      `Advertisement No. ${latestAdvertisement.advertisementNumber}-${latestAdvertisement.year}`
    );

    console.log(
      latestAdvertisement.url
    );

    return latestAdvertisement.url;
  } catch (error) {
    console.error(
      "Unable to find latest UPSC advertisement:",
      error.message
    );

    return null;
  }
};

// ========================================
// Fetch jobs from UPSC
// ========================================
const fetchUPSCJobs = async () => {
  try {
    // ----------------------------------------
    // Find latest UPSC PDF automatically
    // ----------------------------------------
    const pdfUrl =
      await findLatestUPSCAdvertisement();

    if (!pdfUrl) {
      console.log(
        "UPSC PDF URL could not be found."
      );

      return [];
    }

    console.log(
      "\nFetching UPSC PDF..."
    );

    // ----------------------------------------
    // Read PDF
    // ----------------------------------------
    const parser = new PDFParse({
      url: pdfUrl,
    });

    const result =
      await parser.getText();

    await parser.destroy();

    const text = result.text;

    console.log(
      "PDF downloaded successfully!"
    );

    console.log(
      "Total pages:",
      result.total
    );

    // ----------------------------------------
    // Extract application dates
    // ----------------------------------------
    const applicationDates =
      extractApplicationDates(text);

    console.log(
      "Application Start Date:",
      applicationDates.applicationStartDate
    );

    console.log(
      "Application End Date:",
      applicationDates.applicationEndDate
    );

    // ----------------------------------------
    // Convert dates into real Date objects
    // ----------------------------------------
    const applicationStartDate =
      convertUPSCDate(
        applicationDates.applicationStartDate,
        false
      );

    const applicationEndDate =
      convertUPSCDate(
        applicationDates.applicationEndDate,
        true
      );

    console.log(
      "Converted Start Date:",
      applicationStartDate
    );

    console.log(
      "Converted End Date:",
      applicationEndDate
    );

    // ----------------------------------------
    // Determine whether applications are active
    // ----------------------------------------
    const applicationIsActive =
      isUPSCApplicationActive(
        applicationStartDate,
        applicationEndDate
      );

    console.log(
      "UPSC application currently active:",
      applicationIsActive
    );

    // ----------------------------------------
    // Find vacancy records
    // ----------------------------------------
    const vacancyPattern =
      /\d+\.\s+\(Vacancy No\./g;

    const positions = [];

    let match;

    while (
      (match =
        vacancyPattern.exec(text)) !== null
    ) {
      positions.push(match.index);
    }

    console.log(
      "\nTotal vacancy records found:",
      positions.length
    );

    // ----------------------------------------
    // Split PDF into vacancy sections
    // ----------------------------------------
    const vacancies = [];

    for (
      let i = 0;
      i < positions.length;
      i++
    ) {
      const start = positions[i];

      const end =
        i + 1 < positions.length
          ? positions[i + 1]
          : text.length;

      const vacancyText = text
        .substring(start, end)
        .replace(/\s+/g, " ")
        .trim();

      vacancies.push(vacancyText);
    }

    // ----------------------------------------
    // Extract job information
    // ----------------------------------------
    const jobs = [];

    vacancies.forEach((vacancy) => {
      const match =
        vacancy.match(
          /^\d+\.\s+\(Vacancy No\.\s+(\d+)\)\s+(.+?)\s+vacanc(?:y|ies)\s+for the post of\s+(.+?)\s+in\s+/i
        );

      if (!match) {
        console.log(
          "Could not extract:",
          vacancy.substring(0, 200)
        );

        return;
      }

      const vacancyNumber =
        match[1];

      const vacancyWords =
        match[2];

      const title =
        match[3].trim();

      const vacancyCount =
        wordsToNumber(
          vacancyWords
        );

      jobs.push({
        source: "UPSC",

        sourceId: vacancyNumber,

        title: title,

        vacancies: vacancyCount,

        notificationUrl: pdfUrl,

        applicationStartDate:
          applicationStartDate,

        applicationEndDate:
          applicationEndDate,

        isActive:
          applicationIsActive,
      });
    });

    // ----------------------------------------
    // Display extracted jobs
    // ----------------------------------------
    console.log(
      "\n=============================="
    );

    console.log(
      "EXTRACTED JOBS"
    );

    console.log(
      "=============================="
    );

    jobs.forEach((job, index) => {
      console.log(
        `\nJob ${index + 1}`
      );

      console.log(
        "Title:",
        job.title
      );

      console.log(
        "Vacancy Number:",
        job.sourceId
      );

      console.log(
        "Vacancies:",
        job.vacancies
      );

      console.log(
        "Application Start:",
        job.applicationStartDate
      );

      console.log(
        "Application End:",
        job.applicationEndDate
      );

      console.log(
        "Active:",
        job.isActive
      );

      console.log(
        "Notification:",
        job.notificationUrl
      );
    });

    console.log(
      "\nTotal jobs extracted:",
      jobs.length
    );

    // ----------------------------------------
    // Save jobs to MongoDB
    // ----------------------------------------
    for (const job of jobs) {
      await Job.findOneAndUpdate(
        {
          source: job.source,

          sourceId: job.sourceId,
        },

        {
          ...job,

          organization:
            "Union Public Service Commission",

          category: "UPSC",

          location: "India",

          isActive:
            job.isActive,
        },

        {
          upsert: true,

          returnDocument: "after",
        }
      );
    }

    // ----------------------------------------
    // Deactivate old UPSC jobs whose
    // application period has ended
    // ----------------------------------------
    try {
      const now = new Date();

      const expiredUPSCJobs =
        await Job.updateMany(
          {
            source: "UPSC",

            applicationEndDate: {
              $lt: now,
            },

            isActive: true,
          },
          {
            $set: {
              isActive: false,
            },
          }
        );

      console.log(
        "Expired UPSC jobs deactivated:",
        expiredUPSCJobs.modifiedCount
      );
    } catch (error) {
      console.error(
        "Failed to deactivate expired UPSC jobs:",
        error.message
      );
    }

    console.log(
      "UPSC jobs saved to MongoDB successfully."
    );

    return jobs;
  } catch (error) {
    console.log(
      "Error:",
      error.message
    );

    return [];
  }
};

// ========================================
// Start UPSC service
// ========================================
const start = async () => {
  try {
    await connectDB();

    await fetchUPSCJobs();

    console.log(
      "\nUPSC service completed successfully."
    );
  } catch (error) {
    console.log(
      "UPSC service failed:",
      error.message
    );
  } finally {
    process.exit(0);
  }
};

// ========================================
// Run service only when executed directly
// ========================================
//
// node services/upscService.js
//
// When imported by jobCollector.js:
//
// require("./upscService")
//
// the start() function will NOT execute.
if (require.main === module) {
  start();
}

// ========================================
// Export service
// ========================================
module.exports = fetchUPSCJobs;