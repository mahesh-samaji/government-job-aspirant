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

const RRB_SECUNDERABAD_URL =
  "https://rrbsecunderabad.gov.in/employment-notice/";

const collectRRBSecunderabad = async () => {
  await connectDB();

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();

  try {
    const page = await context.newPage();

    console.log("========================================");
    console.log("RRB SECUNDERABAD COLLECTOR");
    console.log("========================================");

    console.log("\nOpening RRB Secunderabad...");

    await page.goto(RRB_SECUNDERABAD_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("RRB Secunderabad loaded.");
    console.log("Final URL:", page.url());

    const allLinks = await page.locator("a").evaluateAll(
      (links) => {
        return links
          .map((link) => ({
            text: (link.innerText || "").trim(),
            href: link.href || "",
          }))
          .filter((link) => link.href);
      }
    );

    console.log(
      `Found ${allLinks.length} total links on the page.`
    );

    /*
     * Secunderabad publishes many direct PDF links.
     *
     * We only want:
     * - 2026 CEN notifications
     * - English
     * - Main detailed notification
     *
     * We exclude:
     * - Hindi PDFs
     * - FAQs
     * - Corrigendums
     * - Addendums
     * - Indicative notices
     */

    const notificationLinks = allLinks.filter((link) => {
      const text = link.text.toLowerCase();
      const href = link.href.toLowerCase();

      const combined = `${text} ${href}`;

      const is2026 =
        combined.includes("2026");

      const isCEN =
        combined.includes("cen");

      const isPdf =
        href.endsWith(".pdf") ||
        href.includes(".pdf?");

      const isHindi =
        combined.includes("hindi") ||
        combined.includes("%e0%a4");

      const isFaq =
        combined.includes("faq");

      const isCorrigendum =
        combined.includes("corrigendum");

      const isAddendum =
        combined.includes("addendum");

      const isIndicative =
        combined.includes("indicative");

      return (
        is2026 &&
        isCEN &&
        isPdf &&
        !isHindi &&
        !isFaq &&
        !isCorrigendum &&
        !isAddendum &&
        !isIndicative
      );
    });

    const uniqueLinks = Array.from(
      new Map(
        notificationLinks.map((link) => [
          link.href,
          link,
        ])
      ).values()
    );

    console.log(
      `Found ${uniqueLinks.length} main English CEN PDFs.`
    );

    const results = [];

    for (const [index, link] of uniqueLinks.entries()) {
      console.log("\n========================================");
      console.log(
        `PROCESSING ${index + 1}/${uniqueLinks.length}`
      );
      console.log("========================================");

      console.log("PDF:", link.href);

      try {
        /*
         * These are direct PDF URLs.
         * Do NOT use page.goto().
         *
         * Playwright request downloads the PDF directly.
         */

        const response =
          await context.request.get(
            link.href
          );

        if (!response.ok()) {
          throw new Error(
            `PDF request failed with HTTP ${response.status()}`
          );
        }

        const contentType =
          response.headers()["content-type"] || "";

        console.log(
          "HTTP status:",
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

        const pdfText =
          await extractPdfText(
            pdfBuffer
          );

        if (!pdfText.trim()) {
          throw new Error(
            "No text could be extracted from PDF."
          );
        }

        console.log(
          "PDF text extracted."
        );

        const cenNumber =
          extractCenNumber(
            pdfText
          );

        const title =
          extractJobTitle(
            pdfText
          );

        const dates =
          extractApplicationDates(
            pdfText
          );

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

        if (!cenNumber) {
          console.log(
            "CEN number could not be extracted."
          );

          results.push({
            status: "skipped",
            reason:
              "CEN number could not be extracted.",
            pdfUrl: link.href,
          });

          continue;
        }

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

        /*
         * Check whether the application is currently open.
         *
         * IMPORTANT:
         * We do NOT skip closed applications here.
         *
         * Closed applications must go through
         * processRRBDocument() so that existing
         * database records can be deactivated.
         */

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

        /*
         * Send BOTH open and closed applications
         * through the RRB pipeline.
         *
         * Open application:
         * -> create/update active record
         *
         * Closed application:
         * -> deactivate existing record
         */

        const result =
          await processRRBDocument({
            pdfText,
            notificationUrl:
              link.href,
            source:
              "RRB_SECUNDERABAD",
            organization:
              "Railway Recruitment Board Secunderabad",
          });

        console.log(
          "Database result:",
          result.status
        );

        results.push({
          status: result.status,
          cenNumber:
            result.cenNumber,
          title,
          applicationStartDate,
          applicationEndDate,
          pdfUrl: link.href,
        });
      } catch (error) {
        console.error(
          "❌ Failed to process PDF:",
          error.message
        );

        results.push({
          status: "error",
          pdfUrl: link.href,
          reason: error.message,
        });
      }
    }

    console.log(
      "\n\n========================================"
    );

    console.log(
      "RRB SECUNDERABAD COLLECTION COMPLETE"
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
  collectRRBSecunderabad,
};