const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const users = [];
let nextId = 1;

exports.users = users;

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      onboardingCompleted: user.onboardingCompleted,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}


exports.signup = async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!name || name.length < 2) return res.status(400).json({ error: "Name too short" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
  if (!password || password.length < 6) return res.status(400).json({ error: "Password too short" });

  if (users.some(u => u.email === email)) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nextId++, name, email, passwordHash, onboardingCompleted: false, };
  users.push(user);

  const token = signToken(user);
  return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, onboardingCompleted: user.onboardingCompleted, } });
};

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!isValidEmail(email) || !password) return res.status(400).json({ error: "Email and password required" });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, onboardingCompleted: user.onboardingCompleted, } });
};

