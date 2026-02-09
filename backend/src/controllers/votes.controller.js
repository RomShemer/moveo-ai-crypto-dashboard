const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * POST /api/votes
 * body: { section, itemKey, value }
 */
async function createOrUpdateVote(req, res) {
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

/**
 * DELETE /api/votes/:itemKey
 */
async function deleteVote(req, res) {
  const userId = req.user.id;
  const { itemKey } = req.params;

  try {
    await prisma.vote.delete({
      where: {
        userId_itemKey: {
          userId,
          itemKey,
        },
      },
    });

    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
}

/**
 * GET /api/votes/:itemKey
 */
async function getMyVote(req, res) {
  const userId = req.user.id;
  const { itemKey } = req.params;

  try {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_itemKey: {
          userId,
          itemKey,
        },
      },
    });

    res.json({
      value: vote?.value ?? null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vote" });
  }
}

module.exports = {
  createOrUpdateVote,
  deleteVote,
  getMyVote,
};
