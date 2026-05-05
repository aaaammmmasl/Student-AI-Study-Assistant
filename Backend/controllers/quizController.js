const pdfService = require("../services/pdfService");
const quizService = require("../services/quizService");

exports.handleQuiz = async (req, res) => {
  try {
    const context = (req.body.context || "").trim();
    const questionCount = Number(req.body.questionCount) || 10;
    const optionCount = Number(req.body.optionCount) || 3;
    const files = Array.isArray(req.files) ? req.files : [];

    let finalContext = context;

    // PDF أولًا
    if (files.length > 0) {
      const pdfText = await pdfService.extractText(files);
      if (pdfText && pdfText.trim()) {
        finalContext = pdfText.trim();
      }
      
    }

    // إذا لا يوجد شيء
    if (!finalContext) {
      return res.status(400).json({
        error: "No valid context provided",
      });
    }

    const quiz = await quizService.generateQuiz({
      context: finalContext,
      questionCount,
      optionCount,
    });

    return res.json({ quiz });
  } catch (error) {
    console.log("Quiz Controller Error:", error);
    return res.status(500).json({
      error: "Failed to generate quiz",
    });
  }
};
