const prisma = require("../db/prisma");

// GET ALL SESSIONS
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.session.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(sessions);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch sessions",
    });
  }
};

// CREATE SESSION
exports.createSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await prisma.session.create({
      data: {
        title: req.body.title || "New Session",
        userId,
      },
    });

    res.json(session);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to create session",
    });
  }
};

//RENAME SESSION
exports.renameSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    const session = await prisma.session.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: { title },
    });

    res.json(updatedSession);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to rename session",
    });
  }
};

// DELETE SESSION
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;

    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { sessionId: id },
      }),
      prisma.session.deleteMany({
        where: {
          id,
          userId,
        },
      }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to delete session",
    });
  }
};
