const quizService = require("../services/quizService");

exports.handleQuiz = async (req, res) => {
  try {
    const { context, questionCount, optionCount } = req.body;

    if (!context || !context.trim()) {
      return res.status(400).json({
        error: "Context is required",
      });
    }

    const quiz = await quizService.generateQuiz({
      context,
      questionCount: Number(questionCount) || 10,
      optionCount: Number(optionCount) || 3,
    });

    res.json({ quiz });
  } catch (error) {
    console.log("Quiz Controller Error:", error);
    res.status(500).json({
      error: "Failed to generate quiz",
    });
  }
};
