const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

exports.uploadMiddleware = upload.single("file");

exports.extractText = async (req) => {
  const file = req.file;

  const dataBuffer = fs.readFileSync(file.path);
  const pdfData = await pdfParse(dataBuffer);

  fs.unlinkSync(file.path);

  return pdfData.text;
};