exports.summarizeText = (req, res) => {
  const { text } = req.body;

  res.json({
    summary: "Summarycn: " + text.slice(0, 50),
  });
};