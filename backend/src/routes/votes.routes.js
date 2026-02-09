const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  createOrUpdateVote,
  getMyVote,
  deleteVote,
} = require("../controllers/votes.controller");

const router = express.Router();

router.use(requireAuth);

router.post("/", createOrUpdateVote);
router.delete("/:itemKey", deleteVote);
router.get("/:itemKey", getMyVote);

module.exports = router;
