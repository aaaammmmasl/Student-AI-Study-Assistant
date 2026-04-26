const fs = require("fs");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");

// تخزين مؤقت للملفات
const upload = multer({
  dest: "uploads/",
});

// middleware
exports.uploadMiddleware = upload.single("file");

// استخراج النص من PDF
exports.extractText = async (file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const dataBuffer = fs.readFileSync(file.path);

  // إنشاء instance
  const parser = new PDFParse({ data: dataBuffer });

  const result = await parser.getText();

  // حذف الملف بعد القراءة
  fs.unlinkSync(file.path);

  return result.text;
};