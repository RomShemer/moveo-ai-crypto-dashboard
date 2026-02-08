const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createVote(req, res) {
  const userId = req.user.id;
  const { section, itemKey, value } = req.body;

  if (!section || !itemKey || ![1, -1].includes(value)) {
    return res.status(400).json({ message: "Invalid vote payload" });
  }

  try {
    const vote = await prisma.vote.upsert({
      where: {
        userId_itemKey: {
          userId,
          itemKey,
        },
      },
      update: {
        value,
      },
      create: {
        userId,
        section,
        itemKey,
        value,
      },
    });

    res.json({ success: true, vote });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to save vote" });
  }
}

module.exports = { createVote };
