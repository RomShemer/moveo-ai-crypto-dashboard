const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const prisma = require("../prisma");

// =======================
// GET /api/me
// =======================
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user,
    });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
