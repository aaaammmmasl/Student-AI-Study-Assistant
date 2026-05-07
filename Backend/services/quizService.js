const axios = require("axios");

exports.generateQuiz = async ({
  context,
  questionCount = 10,
  optionCount = 3,
}) => {
  try {
    const systemPrompt = `
You are StudyPilot, an AI study assistant.

Generate a quiz in STRICT JSON format ONLY.
Do NOT include markdown, explanations, or any text outside JSON.

Return JSON in EXACT structure:

{
  "questions": [
    {
      "id": number,
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string
    }
  ]
}

Rules:
- ALWAYS create exactly ${questionCount} questions.
- Each question must have exactly ${optionCount} options.
- correctIndex must be a valid zero-based index.
- explanation must clearly explain the correct answer.
- Use ONLY the provided context.
- If context is short, generate simpler questions.
- DO NOT change the JSON structure.
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
    // CONSOLE
    console.log("RAW AI RESPONSE:", raw);

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
