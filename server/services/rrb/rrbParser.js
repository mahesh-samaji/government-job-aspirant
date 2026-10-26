const extractApplicationDates = (text) => {
  if (!text) {
    return {
      applicationStartDate: null,
      applicationEndDate: null,
    };
  }

  const cleanText = text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const patterns = [
    /online application.*?(?:from|starts? on)\s*:?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4}).*?(?:to|till|up to|closing date|last date|closes? on|closed on)\s*:?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /application.*?(?:from|starts? on)\s*:?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4}).*?(?:to|till|up to|closing date|last date|closes? on|closed on)\s*:?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,

    /(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*(?:to|-)\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);

    if (match) {
      return {
        applicationStartDate: match[1],
        applicationEndDate: match[2],
      };
    }
  }

  return {
    applicationStartDate: null,
    applicationEndDate: null,
  };
};


const extractCenNumber = (text) => {
  if (!text) {
    return null;
  }

  const match = text.match(
    /CEN\s*[-/]?\s*(\d{1,2})\s*[-/]?\s*(\d{4})/i
  );

  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, "0")}/${match[2]}`;
};


const cleanPdfText = (text) => {
  return text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};


const cleanTitle = (title) => {
  if (!title) {
    return "";
  }

  return title
    .replace(/\s+/g, " ")
    .replace(/^[\s:,-]+|[\s:,-]+$/g, "")
    .trim();
};


const extractJobTitle = (text) => {
  if (!text) {
    return "";
  }

  const cleanText = cleanPdfText(text);

  // --------------------------------------------------
  // 1. Look near the beginning of the PDF first.
  //
  // Recruitment title normally appears near the
  // beginning of the official CEN notification.
  // --------------------------------------------------

  const firstPart = cleanText.substring(0, 12000);

  // --------------------------------------------------
  // 2. CEN 04/2026
  //
  // The official PDF filename and notification identify
  // this recruitment as Junior Engineer / DMS.
  // --------------------------------------------------

  if (/CEN\s*[-/]?\s*04\s*[-/]?\s*2026/i.test(firstPart)) {
    if (
      /Junior Engineer/i.test(firstPart) &&
      /Depot Material Superintendent/i.test(firstPart)
    ) {
      return "Junior Engineer (JE) and Depot Material Superintendent (DMS)";
    }
  }

  // --------------------------------------------------
  // 3. CEN 05/2026
  // --------------------------------------------------

  if (/CEN\s*[-/]?\s*05\s*[-/]?\s*2026/i.test(firstPart)) {
    if (/Paramedical Categories/i.test(firstPart)) {
      return "Paramedical Categories";
    }
  }

  // --------------------------------------------------
  // 4. Look for "RECRUITMENT OF ..."
  //
  // We only search the beginning of the document so
  // random sentences later in the PDF cannot become
  // the title.
  // --------------------------------------------------

  const recruitmentPatterns = [
    /RECRUITMENT\s+OF\s+(.{10,300}?)(?=\s+(?:IN\s+THE\s+RAILWAYS|THROUGH|AGAINST|FOR\s+THE|ONLINE|IMPORTANT|ELIGIBILITY|EDUCATIONAL|AGE\s+LIMIT|PAY\s+LEVEL|TABLE\s+OF\s+CONTENTS))/i,

    /RECRUITMENT\s+OF\s+(.{10,300}?)(?=\s*[.:]\s*(?:ONLINE|IMPORTANT|ELIGIBILITY|EDUCATIONAL|AGE|PAY))/i,
  ];

  for (const pattern of recruitmentPatterns) {
    const match = firstPart.match(pattern);

    if (match) {
      const title = cleanTitle(match[1]);

      if (
        title &&
        title.length >= 5 &&
        title.length <= 300 &&
        !/scribe shall be subject/i.test(title)
      ) {
        return title;
      }
    }
  }

  // --------------------------------------------------
  // 5. "RECRUITMENT FOR ..."
  // --------------------------------------------------

  const recruitmentForMatch = firstPart.match(
    /RECRUITMENT\s+FOR\s+(.{10,250}?)(?=\s+(?:IN\s+THE\s+RAILWAYS|THROUGH|ONLINE|IMPORTANT|ELIGIBILITY))/i
  );

  if (recruitmentForMatch) {
    const title = cleanTitle(recruitmentForMatch[1]);

    if (
      title &&
      title.length >= 5 &&
      title.length <= 300
    ) {
      return title;
    }
  }

  // --------------------------------------------------
  // 6. "ENGAGEMENT OF ..."
  // --------------------------------------------------

  const engagementMatch = firstPart.match(
    /ENGAGEMENT\s+OF\s+(.{10,250}?)(?=\s+(?:IN\s+THE\s+RAILWAYS|THROUGH|ONLINE|IMPORTANT|ELIGIBILITY))/i
  );

  if (engagementMatch) {
    const title = cleanTitle(engagementMatch[1]);

    if (
      title &&
      title.length >= 5 &&
      title.length <= 300
    ) {
      return title;
    }
  }

  // --------------------------------------------------
  // 7. Final fallback
  //
  // Do not return a random sentence from the middle
  // of a large PDF.
  // --------------------------------------------------

  return "";
};


module.exports = {
  extractApplicationDates,
  extractCenNumber,
  extractJobTitle,
};