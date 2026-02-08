const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      onboardingCompleted: req.user.onboardingCompleted || false,
    }
  });
});

module.exports = router;
