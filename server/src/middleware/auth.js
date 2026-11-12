const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const prisma = require("../config/prisma");

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found or account deactivated." });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticateToken;

