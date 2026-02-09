const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const prisma = require("../prisma");

router.post("/complete", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        onboardingCompleted: true,
      },
    });

    return res.json({ user });
  } catch (err) {
    console.error("POST /onboarding/complete error:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
