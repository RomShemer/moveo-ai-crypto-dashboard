const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  console.log("1. Middleware reached"); // שורה חדשה
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // התיקון הקריטי: לוקחים את decoded.sub כי ככה הגדרת ב-signToken
    req.user = {
      id: decoded.sub, 
      email: decoded.email,
      name: decoded.name,
    };

    // חשוב: לוודא שקיימת קריאה אחת בלבד ל-next()
    next();
  } catch (err) {
    console.error("❌ middleware error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };