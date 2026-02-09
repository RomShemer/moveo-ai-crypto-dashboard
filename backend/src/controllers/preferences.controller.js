const prisma = require("../prisma"); 

exports.savePreferences = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub; 
    const { assets, investorType, contentTypes } = req.body;

    if (!userId) return res.status(401).json({ error: "Missing user in token" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const pref = await prisma.preference.upsert({
      where: { userId }, 
      update: {
        assets,
        investorType,
        contentTypes,
        updatedAt: new Date(),
      },
      create: {
        userId,
        assets,
        investorType,
        contentTypes,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    return res.json({
      message: "Preferences saved",
      preferences: pref,
    });
  } catch (err) {
    console.error("savePreferences error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub;
    if (!userId) return res.status(401).json({ error: "Missing user in token" });

    const pref = await prisma.preference.findUnique({
      where: { userId },
    });

    return res.json({ preferences: pref || null });
  } catch (err) {
    console.error("getPreferences error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
