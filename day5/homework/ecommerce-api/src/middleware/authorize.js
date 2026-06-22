/**
 * Authorization middleware factory
 * Kiểm tra role sau khi authenticate
 */

"use strict";

/**
 * Middleware kiểm tra role.
 * Phải dùng SAU authenticate middleware.
 *
 * @param {...string} roles - Các role được phép
 *
 * @example
 * router.post("/products", authenticate, authorize("admin"), productsController.create);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = authorize;
