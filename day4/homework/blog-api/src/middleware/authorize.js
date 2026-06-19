/**
 * authorize middleware factory
 * Tái sử dụng từ Day 3 — không thay đổi logic
 *
 * Dùng SAU authenticate:
 *   router.delete("/:id", authenticate, authorize("admin"), ...)
 */

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to perform this action",
      });
    }

    next();
  };
}

module.exports = authorize;
