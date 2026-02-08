const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const {
  savePreferences,
  getPreferences,
} = require("../controllers/preferences.controller");

router.post("/", requireAuth, savePreferences);
router.get("/", requireAuth, getPreferences);

module.exports = router;
