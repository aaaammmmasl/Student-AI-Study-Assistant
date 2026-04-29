const axios = require("axios");

exports.generateSummary = async (message, messages = []) => {
  try {
    // 1. System prompt (يوجه الذكاء)
    const systemPrompt = {
      role: "system",
      content: `
You are StudyPilot, an AI study assistant.
Your job:
- Summarize clearly
- Explain simply
- Create quizzes if requested
- Use structured bullet points when needed
- Be concise and educational
      `.trim(),
    };

    // 2. تنظيف history
    const formattedMessages = [];

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (!msg?.content) continue;

        formattedMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: String(msg.content).slice(0, 4000),
        });
      }
    }

    // 3. الرسالة الحالية
    formattedMessages.push({
      role: "user",
      content: String(message).slice(0, 4000),
    });

    // 4. إرسال الطلب
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [systemPrompt, ...formattedMessages],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices?.[0]?.message?.content || "No response";
  } catch (error) {
    console.log("OpenRouter Error:", error.response?.data || error.message);

    throw new Error("Failed to generate AI response");
  }
};
