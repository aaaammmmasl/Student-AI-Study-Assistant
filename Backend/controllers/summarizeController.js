exports.summarizeText = (req, res) => {
  try {
    const { prompt, text } = req.body || {};

    if (!prompt && !text) {
      return res.status(400).json({
        error: "prompt or text is required",
      });
    }

    const finalText = text || "";

    res.json({
      summary: `
      Prompt: ${prompt || "default prompt"}

      Summary: ${finalText.slice(0, 200)}
      `,
    });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};
