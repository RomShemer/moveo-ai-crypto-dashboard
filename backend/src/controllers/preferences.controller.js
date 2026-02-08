const { users } = require("./auth.controller");

exports.savePreferences = (req, res) => {
  const userId = req.user.sub;
  const { assets, investorType, contentTypes } = req.body;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.preferences = {
    assets,
    investorType,
    contentTypes,
  };

  return res.json({
    message: "Preferences saved",
    preferences: user.preferences,
  });
};

exports.getPreferences = (req, res) => {
  const userId = req.user.sub;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    preferences: user.preferences || null,
  });
};
