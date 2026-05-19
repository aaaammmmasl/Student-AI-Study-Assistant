const prisma = require("../db/prisma");
const pdfService = require("../services/pdfService");
const aiService = require("../services/aiService");

exports.handleChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, sessionId } = req.body;
    const files = Array.isArray(req.files) ? req.files : [];

    // make sure the session for the user
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // 2. bring last messages from the db
    const recentMessages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    //  from new to old
    const conversation = recentMessages.reverse();

    let finalText = message || "";

    if (files.length > 0) {
      const pdfText = await pdfService.extractText(files);

      finalText += `\n\nPDF Content:\n${pdfText}`;
    }

    const reply = await aiService.generateSummary(finalText, conversation);

    res.json({ reply });
  } catch (error) {
    console.log("Chat Error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
    });
  }
};
