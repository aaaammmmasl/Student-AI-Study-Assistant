const axios = require("axios");

exports.generateQuiz = async ({
  context,
  questionCount = 10,
  optionCount = 3,
}) => {
  try {
    const systemPrompt = `
You are StudyPilot, an AI study assistant.

Generate a quiz in STRICT JSON only.
Do not include markdown, explanations outside JSON, or extra text.

Rules:
- Create exactly ${questionCount} questions unless the context is too short.
- Each question must have exactly ${optionCount} options unless impossible.
- Each question must have:
  - id
  - question
  - options
  - correctIndex
  - explanation
- correctIndex must be a valid zero-based index.
- explanation must explain why the answer is correct.
- Keep questions based only on the provided context.
- Return valid JSON only.
`.trim();

    const userPrompt = `
Create a quiz from this context:

${context}
`.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const raw = response.data.choices?.[0]?.message?.content || "{}";

    // محاولة تنظيف النص إذا رجع JSON داخل ```json
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.log("Quiz Error:", error.response?.data || error.message);
    throw new Error("Failed to generate quiz");
  }
};
