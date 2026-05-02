const fs = require("fs");
const multer = require("multer");
const pdfModule = require("pdf-parse");
const pdf = pdfModule.default || pdfModule;

const upload = multer({
  dest: "uploads/",
});

exports.uploadMiddleware = upload.array("files");

exports.extractText = async (file) => {
  if (!file) throw new Error("No file uploaded");

  const dataBuffer = fs.readFileSync(file.path);

  try {
    const result = await pdf(dataBuffer);
    return result.text;
  } finally {
    fs.unlinkSync(file.path);
  }
};
