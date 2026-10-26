const { chromium } = require("playwright");

const connectDB = require("../../../config/db");

const { extractPdfText } = require("../rrbDocumentFetcher");

const {
  extractApplicationDates,
  extractCenNumber,
  extractJobTitle,
} = require("../rrbParser");

const {
  parseDate,
  isApplicationOpen,
} = require("../rrbDateValidator");

const {
  processRRBDocument,
} = require("../rrbPipeline");

const RRB_CHENNAI_URL =
  "https://rrbchennai.gov.in/";

const collectRRBChennai = async () => {
  // --------------------------------------------------
  // 0. CONNECT TO MONGODB
  // --------------------------------------------------

  await connectDB();

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();

  try {
    const page = await context.newPage();

    console.log("========================================");
    console.log("RRB CHENNAI COLLECTOR");
    console.log("========================================");

    console.log("\nOpening RRB Chennai...");

    await page.goto(RRB_CHENNAI_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("RRB Chennai loaded.");
    console.log("Final URL:", page.url());

    // --------------------------------------------------
    // 1. DISCOVER NOTIFICATION LINKS
    // --------------------------------------------------

    const notificationLinks = await page.locator("a").evaluateAll(
      (links) => {
        return links
          .map((link) => ({
            text: (link.innerText || "").trim(),
            href: link.href || "",
          }))
          .filter((link) => {
            const href = link.href.toLowerCase();

            return (
              href.includes("getdata") &&
              href.includes("category=notification") &&
              href.includes("cenum=")
            );
          });
      }
    );

    const uniqueLinks = Array.from(
      new Map(
        notificationLinks.map((link) => [link.href, link])
      ).values()
    );

    console.log(
      `\nFound ${uniqueLinks.length} unique notification links.`
    );

    const results = [];

    // --------------------------------------------------
    // 2. PROCESS EACH CEN
    // --------------------------------------------------

    for (const [index, link] of uniqueLinks.entries()) {
      console.log("\n========================================");
      console.log(
        `PROCESSING ${index + 1}/${uniqueLinks.length}`
      );
      console.log("========================================");

      console.log("Notification:", link.text);
      console.log("URL:", link.href);

      const notificationPage = await context.newPage();

      // Get CEN number from notification URL.
      // Example: 05/2026
      const cenFromUrl =
        new URL(link.href).searchParams.get("cenum");

      try {
        // --------------------------------------------------
        // 3. OPEN NOTIFICATION PAGE
        // --------------------------------------------------

        await notificationPage.goto(link.href, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });

        // --------------------------------------------------
        // 4. FIND MAIN DETAILED NOTIFICATION ROW
        // --------------------------------------------------

        const rows = await notificationPage
          .locator("tr.publicR")
          .all();

        let selectedRow = null;

        for (const row of rows) {
          const cells = await row
            .locator("td")
            .allInnerTexts();

          if (cells.length < 6) {
            continue;
          }

          const rowCen = cells[1].trim();

          // Make sure this row belongs to the CEN
          // currently being processed.
          if (rowCen !== cenFromUrl) {
            continue;
          }

          // --------------------------------------------------
          // Check PDF options
          // --------------------------------------------------

          const hasPdfOptions = await row
            .locator("select option")
            .count();

          if (hasPdfOptions === 0) {
            continue;
          }

          const optionValues = await row
            .locator("select option")
            .evaluateAll((options) => {
              return options
                .map((option) => option.value || "")
                .filter(Boolean);
            });

          // --------------------------------------------------
          // Find the MAIN English CEN notification.
          //
          // We intentionally reject:
          // - corrigendum
          // - addendum
          //
          // This prevents CEN 04/2026 from selecting:
          // Corrigendum_1_CEN_04-2026_English.pdf
          // --------------------------------------------------

          const hasMainNotificationPdf =
            optionValues.some((value) => {
              const lowerValue =
                value.toLowerCase();

              return (
                lowerValue.includes("cen") &&
                lowerValue.includes("english") &&
                !lowerValue.includes("corrigendum") &&
                !lowerValue.includes("addendum")
              );
            });

          if (hasMainNotificationPdf) {
            selectedRow = row;
            break;
          }
        }

        if (!selectedRow) {
          console.log(
            "No main detailed notification PDF found."
          );

          results.push({
            status: "skipped",
            cenNumber: cenFromUrl,
            reason:
              "Main detailed notification PDF not found.",
          });

          continue;
        }

        // --------------------------------------------------
        // 5. FIND ENGLISH PDF
        // --------------------------------------------------

        const options = await selectedRow
          .locator("select option")
          .evaluateAll((options) => {
            return options
              .map((option) => ({
                text: (option.innerText || "").trim(),
                value: option.value || "",
              }))
              .filter((option) => option.value);
          });

        const englishOption = options.find(
          (option) => {
            const value =
              option.value.toLowerCase();

            return (
              value.includes("english") &&
              value.includes("cen") &&
              !value.includes("corrigendum") &&
              !value.includes("addendum")
            );
          }
        );

        if (!englishOption) {
          console.log("English PDF not found.");

          results.push({
            status: "skipped",
            cenNumber: cenFromUrl,
            reason: "English PDF not found.",
          });

          continue;
        }

        const pdfUrl = new URL(
          englishOption.value,
          notificationPage.url()
        ).href;

        console.log(
          "English PDF:",
          pdfUrl
        );

        // --------------------------------------------------
        // 6. DOWNLOAD PDF
        // --------------------------------------------------

        const response =
          await context.request.get(pdfUrl);

        if (!response.ok()) {
          throw new Error(
            `PDF request failed with HTTP ${response.status()}`
          );
        }

        const contentType =
          response.headers()["content-type"] || "";

        console.log(
          "PDF HTTP status:",
          response.status()
        );

        console.log(
          "Content-Type:",
          contentType
        );

        const pdfBuffer =
          await response.body();

        if (
          pdfBuffer
            .subarray(0, 4)
            .toString() !== "%PDF"
        ) {
          throw new Error(
            "Downloaded response is not a valid PDF."
          );
        }

        console.log(
          "PDF downloaded:",
          pdfBuffer.length,
          "bytes"
        );

        // --------------------------------------------------
        // 7. EXTRACT PDF TEXT
        // --------------------------------------------------

        const pdfText =
          await extractPdfText(pdfBuffer);

        if (!pdfText.trim()) {
          throw new Error(
            "No text could be extracted from PDF."
          );
        }

        console.log(
          "PDF text extracted."
        );

        // --------------------------------------------------
        // 8. EXTRACT INFORMATION
        // --------------------------------------------------

        const cenNumber =
          extractCenNumber(pdfText);

        const title =
          extractJobTitle(pdfText);

        const dates =
          extractApplicationDates(pdfText);

        const applicationStartDate =
          parseDate(
            dates.applicationStartDate
          );

        const applicationEndDate =
          parseDate(
            dates.applicationEndDate
          );

        console.log("\nExtracted:");

        console.log(
          "CEN:",
          cenNumber
        );

        console.log(
          "Title:",
          title
        );

        console.log(
          "Start:",
          dates.applicationStartDate
        );

        console.log(
          "End:",
          dates.applicationEndDate
        );

        // --------------------------------------------------
        // 9. VALIDATE APPLICATION PERIOD
        // --------------------------------------------------

        if (
          !applicationStartDate ||
          !applicationEndDate
        ) {
          console.log(
            "Application dates could not be determined."
          );

          results.push({
            status: "skipped",
            cenNumber,
            title,
            reason:
              "Application dates unavailable.",
          });

          continue;
        }

        const applicationOpen =
          isApplicationOpen(
            applicationStartDate,
            applicationEndDate
          );

        if (!applicationOpen) {
          console.log(
            "❌ Application is not currently open."
          );

          console.log(
            "Sending closed application to RRB pipeline for deactivation..."
          );
        } else {
          console.log(
            "✅ Application period is currently open."
          );
        }

        // IMPORTANT:
        // Do NOT continue here when the application
        // is closed.
        //
        // The expired notification must reach the
        // RRB pipeline so the existing database
        // record can be deactivated.

        // --------------------------------------------------
        // 10. SAVE / DEACTIVATE THROUGH RRB PIPELINE
        // --------------------------------------------------

        const result =
          await processRRBDocument({
            pdfText,
            notificationUrl: pdfUrl,
            source: "RRB_CHENNAI",
            organization:
              "Railway Recruitment Board Chennai",
          });

        console.log(
          "Database result:",
          result.status
        );

        results.push({
          status: result.status,
          cenNumber: result.cenNumber,
          title,
          applicationStartDate,
          applicationEndDate,
          pdfUrl,
        });
      } catch (error) {
        console.error(
          "❌ Failed to process notification:",
          error.message
        );

        results.push({
          status: "error",
          cenNumber: cenFromUrl,
          reason: error.message,
        });
      } finally {
        await notificationPage.close();
      }
    }

    // --------------------------------------------------
    // 11. FINAL SUMMARY
    // --------------------------------------------------

    console.log(
      "\n\n========================================"
    );

    console.log(
      "RRB CHENNAI COLLECTION COMPLETE"
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

module.exports = {
  collectRRBChennai,
};