const prisma = require("../db/prisma");

exports.createMessage = async (req, res) => {
  try {
    const { sessionId, role, content } = req.body;

    if (!sessionId || !role || !content) {
      return res.status(400).json({
        error: "sessionId, role and content are required",
      });
    }

    const message = await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    res.json(message);
  } catch (error) {
    console.log("Create Message Error:", error);
    res.status(500).json({
      error: "Failed to create message",
    });
  }
};

exports.getMessagesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (error) {
    console.log("Get Messages Error:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
    });
  }
};
