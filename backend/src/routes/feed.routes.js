const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");

const {
  getNews,
  getPrices,
  getAiInsight,
  getMeme,
} = require("../controllers/feed.controller");

const router = express.Router();

/*router.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});*/

router.use(requireAuth);

router.get("/news", getNews);
router.get("/prices", getPrices);
router.get("/ai-insight", getAiInsight);
router.get("/meme", getMeme);

module.exports = router;
