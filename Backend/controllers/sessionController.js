const prisma = require("../db/prisma");

// GET ALL SESSIONS
exports.getSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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
    const session = await prisma.session.create({
      data: {
        title: req.body.title || "New Session",
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

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        title,
      },
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

    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { sessionId: id },
      }),
      prisma.session.delete({
        where: { id },
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
