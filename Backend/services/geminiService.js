const axios = require("axios");

exports.generateSummary = async (message, messages = []) => {
  try {
    const systemPrompt = `
You are StudyPilot, an advanced AI study assistant.

RESPONSE RULES:
- Always use clean Markdown formatting.
- Use proper headings with ## and ###.
- Use bullet lists correctly.
- Leave empty lines between sections.
- Use tables when useful.
- Use code blocks with triple backticks when showing code.
- Never write compressed markdown in one line.
- Keep responses visually clean and readable.
- Explain step by step when needed.
- Use educational formatting.
- Avoid repeating unnecessary text.
`;

    const formattedMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        formattedMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    formattedMessages.push({
      role: "user",
      content: message,
    });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: formattedMessages,
        temperature: 0.7,
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
    throw new Error("Failed to generate AI response");
  }
};
