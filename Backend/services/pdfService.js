const pdfModule = require("pdf-parse");
const pdf = pdfModule.default || pdfModule;

exports.extractText = async (files) => {
  if (!files) {
    throw new Error("No files provided");
  }

  //  ضمان أنها Array
  const fileArray = Array.isArray(files) ? files : [files];

  try {
    let fullText = "";

    for (const file of fileArray) {
      if (!file.buffer) continue;

      const result = await pdf(file.buffer);

      if (result.text) {
        fullText += result.text + "\n\n";
      }
    }

    return fullText.trim();
  } catch (error) {
    console.log("PDF Extract Error:", error);
    throw new Error("Failed to extract PDF text");
  }
};
