const pdfService = require("../services/pdfService");

exports.uploadPDF = async (req, res) => {
  try {
    const text = await pdfService.extractText(req);

    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "PDF error" });
  }
};