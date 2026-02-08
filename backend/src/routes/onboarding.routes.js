const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { users } = require("../controllers/auth.controller");

router.post("/complete", requireAuth, (req, res) => {
  const userId = req.user.sub;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.onboardingCompleted = true;

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      onboardingCompleted: true
    }
  });
});

module.exports = router;
