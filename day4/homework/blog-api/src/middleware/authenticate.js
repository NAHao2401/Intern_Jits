/**
 * authenticate middleware
 * Tái sử dụng từ Day 3 — không thay đổi logic
 * Verify JWT từ Authorization header và gán req.user
 */

const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Provide: Authorization: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role, iat, exp }
    next();
  } catch (err) {
    next(err); // TokenExpiredError / JsonWebTokenError -> errorHandler xử lý
  }
}

module.exports = authenticate;
