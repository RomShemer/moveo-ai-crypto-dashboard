const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  // Expect: Authorization: Bearer <token>
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded example: { sub, email, name, iat, exp }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
