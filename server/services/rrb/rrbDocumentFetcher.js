const { PDFParse } = require("pdf-parse");


const extractPdfText = async (pdfBuffer) => {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error("A valid PDF buffer is required.");
  }

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


const isPdfBuffer = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return false;
  }

  const pdfHeader = buffer.subarray(0, 4).toString();

  return pdfHeader === "%PDF";
};


module.exports = {
  extractPdfText,
  isPdfBuffer,
};