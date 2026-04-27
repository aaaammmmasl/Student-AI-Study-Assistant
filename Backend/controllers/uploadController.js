const pdfService = require("../services/pdfService");
const geminiService = require("../services/geminiService");

exports.uploadPDF = async (req, res) => {
  try {
    const { prompt, text } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "PDF file is required",
      });
    }

    // استخراج النص الخام من PDF
    const pdfText = await pdfService.extractText(file);

    // تنظيف وتحسين النص
    const cleanText = (pdfText || "")
      .replace(/\r/g, "") // حذف carriage return
      .replace(/\t/g, " ") // تحويل tab إلى مسافة
      .replace(/[ ]{2,}/g, " ") // تقليل المسافات المتكررة
      .replace(/\n[ ]+/g, "\n") // حذف spaces بعد newline
      .replace(/\n{3,}/g, "\n\n") // تقليل الأسطر الفارغة
      .replace(/•/g, "\n• ") // ترتيب bullets
      .replace(/-{4,}/g, "\n") // حذف خطوط ------
      .trim();

    // دمج نص PDF مع النص اليدوي
    const finalText = `
${cleanText}

${text || ""}
    `.trim();

    const finalPrompt =
      prompt ||
      "Summarize this PDF clearly in bullet points and highlight important ideas.";

    // إرسال للذكاء الاصطناعي
    const summary = await geminiService.generateSummary(finalPrompt, finalText);

    return res.json({
      summary,
    });
  } catch (err) {
    console.log("PDF AI Error:", err);

    return res.status(500).json({
      error: "PDF processing error",
    });
  }
};
