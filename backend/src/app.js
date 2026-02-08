const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const preferencesRoutes = require("./routes/preferences.routes");
const feedRoutes = require("./routes/feed.routes");
const votesRoutes = require("./routes/votes.routes.js");



const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

app.use("/api/onboarding", onboardingRoutes);
app.use("/api/preferences", preferencesRoutes);

app.use("/api/feed", feedRoutes);

app.use("/api/votes", votesRoutes);

module.exports = app;
