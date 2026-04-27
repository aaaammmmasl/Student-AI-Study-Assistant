const geminiService = require("../services/geminiService");

exports.summarizeText = async (req, res) => {
  try {
    const { prompt, text } = req.body || {};

    if (!text && !prompt) {
      return res.status(400).json({
        error: "prompt or text is required",
      });
    }

    const finalPrompt =
      prompt || "Summarize this text clearly in bullet points.";

    const summary = await geminiService.generateSummary(
      finalPrompt,
      text || "",
    );

    return res.json({
      summary,
    });
  } catch (error) {
    console.log("Summarize Error:", error);

    return res.status(500).json({
      error: "Failed to summarize text",
    });
  }
};
