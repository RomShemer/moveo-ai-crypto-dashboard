const express = require("express");
const { createVote } = require("../controllers/votes.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, createVote);

module.exports = router;
