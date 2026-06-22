/**
 * Authentication middleware
 * Verify JWT token, gắn req.user
 */

"use strict";

const jwt = require("jsonwebtoken");

/**
 * Middleware kiểm tra JWT Bearer token.
 * Gắn req.user = { id, email, role } nếu hợp lệ.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "No token provided",
    });
  }

  const token = authHeader.slice(7); // "Bearer ".length === 7

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired" });
    }
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};

module.exports = authenticate;
