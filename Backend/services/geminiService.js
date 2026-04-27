const axios = require("axios");

exports.generateSummary = async (prompt, text) => {
  try {
    const fullPrompt = `
${prompt}

Important formatting rules:
- Respond clearly.
- Use separate lines.
- Use numbered bullet points.
- Keep it clean and readable.

Text:
${text}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.log("OpenRouter Error:", error.response?.data || error.message);
    throw new Error("Failed to generate summary");
  }
};
