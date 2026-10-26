const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SSC_PDF_URL =
  "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_RHQ_2026_phase_xiv.pdf";

const PDF_PATH = path.join(__dirname, "../temp_ssc_phase_xiv.pdf");

// --------------------------------------------------
// Download SSC PDF
// --------------------------------------------------
async function downloadPdf() {
  console.log("Downloading SSC Phase XIV 2026 PDF...");

  const response = await axios.get(SSC_PDF_URL, {
    responseType: "arraybuffer",
  });

  fs.writeFileSync(PDF_PATH, response.data);

  console.log("SSC PDF downloaded successfully.");
  console.log("File size:", response.data.length, "bytes");
}

// --------------------------------------------------
// Extract PDF text
// --------------------------------------------------
async function extractPdfText() {
  const pdfBuffer = fs.readFileSync(PDF_PATH);

  const parser = new PDFParse({
    data: pdfBuffer,
  });

  const data = await parser.getText();

  console.log("\n========================================");
  console.log("SSC PDF INFORMATION");
  console.log("========================================");

  console.log("Total pages:", data.total);
  console.log("Total characters:", data.text.length);

  await parser.destroy();

  return data.text;
}

// --------------------------------------------------
// Remove PDF page markers
// --------------------------------------------------
function cleanPdfText(text) {
  return text
    // Remove SSC page footer
    .replace(
      /For detailed information on categories of Posts, please visit:\s*https:\/\/ssc\.gov\.in\/rhq-selection-post\/rhq-post-details/gi,
      "\n"
    )

    // Remove PDF page markers
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "\n")

    // Remove carriage returns
    .replace(/\r/g, "")

    // Normalize spaces
    .replace(/[ \t]+/g, " ")

    // Remove excessive blank lines
    .replace(/\n{3,}/g, "\n\n")

    .trim();
}
// --------------------------------------------------
// Extract vacancy numbers
//
// Order:
// SC ST OBC UR EWS Total ESM OH HH VH Others
// --------------------------------------------------
function extractVacancies(rowText) {
  // SSC vacancy columns:
  // SC ST OBC UR EWS Total ESM OH HH VH Others

  const numberPattern =
    /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/g;

  const matches = [...rowText.matchAll(numberPattern)];

  if (matches.length === 0) {
    return null;
  }

  // Use the LAST valid group of 11 numbers.
  const match = matches[matches.length - 1];

  return {
    sc: Number(match[1]),
    st: Number(match[2]),
    obc: Number(match[3]),
    ur: Number(match[4]),
    ews: Number(match[5]),
    total: Number(match[6]),
    esm: Number(match[7]),
    oh: Number(match[8]),
    hh: Number(match[9]),
    vh: Number(match[10]),
    others: Number(match[11]),
  };
}
// --------------------------------------------------
// Extract one SSC row
// --------------------------------------------------
function parseRow(rowText) {
  const text = rowText
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove the Sr No + Region + Post Code from beginning
  const prefixMatch = text.match(
    /^(\d+)\s+([A-Z]{2,3})\s+([A-Z]{2,3}\d{5})\s+(.+)$/
  );

  if (!prefixMatch) {
    return null;
  }

  const srNo = Number(prefixMatch[1]);
  const region = prefixMatch[2];
  const postCode = prefixMatch[3];
  let remaining = prefixMatch[4].trim();

  // Extract vacancy information from the end
  const vacancies = extractVacancies(remaining);

  if (!vacancies) {
    return null;
  }

  // Remove vacancy numbers from the row
  const vacancyPattern =
  /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/g;

const vacancyMatches = [...remaining.matchAll(vacancyPattern)];

if (vacancyMatches.length === 0) {
  return null;
}

const vacancyMatch = vacancyMatches[0];

remaining = remaining.substring(0, vacancyMatch.index).trim();

  // Extract age limit
  const ageMatch = remaining.match(/\b(\d{1,2})\s*-\s*(\d{1,2})\b/);

  if (!ageMatch) {
    return null;
  }

  const ageLimit = `${ageMatch[1]}-${ageMatch[2]}`;

  const ageIndex = ageMatch.index;

  // Everything before age is:
  // Name of Post + Name of Department
  const beforeAge = remaining.substring(0, ageIndex).trim();

  // Everything after age
  let afterAge = remaining.substring(ageIndex + ageMatch[0].length).trim();

  // Extract Pay Level
  const payMatch = afterAge.match(/\bLevel\s+[\w-]+/i);

  if (!payMatch) {
    return null;
  }

  const salary = payMatch[0].trim();

  const payIndex = payMatch.index;

  // Text after pay level is Exam Level
  const examLevel = afterAge
    .substring(payIndex + payMatch[0].length)
    .trim();

  // --------------------------------------------------
  // Separate Post Name and Department
  //
  // SSC table does not provide a special delimiter,
  // so we use known department/organization patterns.
  // --------------------------------------------------

  const departmentMarkers = [
    "Ministry of",
    "Department of",
    "Directorate",
    "Office of",
    "National",
    "Central",
    "Regional",
    "Staff Selection Commission",
    "Employees",
    "Commissioner",
    "Government",
    "Council",
    "Institute",
    "Board",
    "Corporation",
    "University",
    "Tribunal",
    "Authority",
    "Director General",
  ];

  let departmentIndex = -1;

  for (const marker of departmentMarkers) {
    const index = beforeAge.indexOf(marker);

    if (index !== -1 && (departmentIndex === -1 || index < departmentIndex)) {
      departmentIndex = index;
    }
  }

  let title;
  let organization;

  if (departmentIndex !== -1) {
    title = beforeAge.substring(0, departmentIndex).trim();
    organization = beforeAge.substring(departmentIndex).trim();
  } else {
    // Fallback if no department marker is detected
    const parts = beforeAge.split(" ");

    title = parts.slice(0, Math.max(1, Math.floor(parts.length / 2))).join(" ");
    organization = parts
      .slice(Math.max(1, Math.floor(parts.length / 2)))
      .join(" ");
  }

  return {
    srNo,
    region,
    postCode,
    title,
    organization,
    ageLimit,
    salary,
    examLevel,
    vacancies,
  };
}

// --------------------------------------------------
// Parse all SSC rows
// --------------------------------------------------
function parseSscPosts(text) {
  const cleanedText = cleanPdfText(text);

  console.log("\n========================================");
  console.log("PARSING SSC POST TABLE");
  console.log("========================================");

  /*
    SSC row starts look like:

    1 CR CR10126
    2 CR CR10226
    3 CR CR10426

    We use the post code to find each row.
  */

  const rowStartRegex =
    /(?:^|\n)\s*(\d{1,3})\s+([A-Z]{2,3})\s+([A-Z]{2,3}\d{5})\s+/g;

  const matches = [];

  let match;

  while ((match = rowStartRegex.exec(cleanedText)) !== null) {
    matches.push({
      index: match.index,
      srNo: Number(match[1]),
      region: match[2],
      postCode: match[3],
    });
  }

  console.log("Possible post rows found:", matches.length);

  const posts = [];
  const failedRows = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];

    const start = current.index;

    const end =
      i + 1 < matches.length
        ? matches[i + 1].index
        : cleanedText.length;

    let rowText = cleanedText.substring(start, end).trim();

    const parsed = parseRow(rowText);

    if (parsed) {
      posts.push(parsed);
    } else {
      failedRows.push({
        srNo: current.srNo,
        region: current.region,
        postCode: current.postCode,
        rowText: rowText.substring(0, 500),
      });
    }
  }

  console.log("Successfully parsed:", posts.length);
  console.log("Failed rows:", failedRows.length);

  return {
    posts,
    failedRows,
  };
}

// --------------------------------------------------
// Display parser results
// --------------------------------------------------
function displayResults(posts, failedRows) {
  console.log("\n========================================");
  console.log("SSC PARSER RESULTS");
  console.log("========================================");

  console.log("Total successfully parsed:", posts.length);
  console.log("Total failed:", failedRows.length);

  console.log("\n----------------------------------------");
  console.log("FIRST 5 POSTS");
  console.log("----------------------------------------");

  posts.slice(0, 5).forEach((post) => {
    console.log(JSON.stringify(post, null, 2));
  });

  console.log("\n----------------------------------------");
  console.log("LAST 5 POSTS");
  console.log("----------------------------------------");

  posts.slice(-5).forEach((post) => {
    console.log(JSON.stringify(post, null, 2));
  });

  if (failedRows.length > 0) {
    console.log("\n----------------------------------------");
    console.log("FAILED ROWS");
    console.log("----------------------------------------");

    failedRows.slice(0, 10).forEach((row) => {
      console.log("\nPost Code:", row.postCode);
      console.log("Row:", row.rowText);
    });
  }
}

// --------------------------------------------------
// Main
// --------------------------------------------------
async function runParser() {
  try {
    await downloadPdf();

    const text = await extractPdfText();

    const { posts, failedRows } = parseSscPosts(text);

    displayResults(posts, failedRows);

    console.log("\n========================================");
    console.log("SSC PARSING COMPLETED");
    console.log("========================================");
  } catch (error) {
    console.error("\nSSC parser failed:");
    console.error(error);
  }
}

module.exports = {
  downloadPdf,
  extractPdfText,
  parseSscPosts,
};

if (require.main === module) {
  runParser();
}