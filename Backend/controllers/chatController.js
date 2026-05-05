const pdfService = require("../services/pdfService");
const aiService = require("../services/geminiService");

exports.handleChat = async (req, res) => {
  try {
    const { message, messages } = req.body;
    const files = Array.isArray(req.files) ? req.files : [];

    let finalText = message || "";

    if (files.length > 0) {
      const pdfText = await pdfService.extractText(files);

      finalText = `
User Message:
${message || ""}

PDF Content:
${pdfText}
      `;
    }

    let conversation = [];

    if (messages) {
      try {
        conversation =
          typeof messages === "string" ? JSON.parse(messages) : messages;
      } catch {
        conversation = [];
      }
    }

    const reply = await aiService.generateSummary(finalText, conversation);

    res.json({
      reply,
    });
  } catch (error) {
    console.log("Chat Error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
    });
  }
};
