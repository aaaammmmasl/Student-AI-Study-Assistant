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

// DELETE SESSION
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.session.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to delete session",
    });
  }
};
