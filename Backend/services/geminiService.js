

const axios = require("axios");

exports.generateSummary = async (message, messages = []) => {
  try {
    const systemPrompt = `
You are StudyPilot, an AI study assistant.

RULES:
- Always respond in a clear structured way.
- Use bullet points when explaining.
- Keep answers simple and educational.
- If user asks for summary → summarize clearly in points.
- If user asks for explanation → explain step by step.
- Never reply with messy or single-line answers unless necessary.
- If context exists, use it intelligently.
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


