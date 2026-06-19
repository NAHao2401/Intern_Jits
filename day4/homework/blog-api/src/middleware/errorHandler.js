/**
 * Error handling middleware
 * Tái sử dụng từ Day 3, thêm xử lý Mongoose-specific errors
 */

/**
 * 404 handler — mount sau tất cả routes
 */
function notFoundHandler(req, res, next) {
  const err = new Error(`Cannot ${req.method} ${req.path}`);
  err.statusCode = 404;
  next(err);
}

/**
 * Global error handler — phải có đúng 4 params: (err, req, res, next)
 * Express nhận diện error middleware bằng 4 tham số này
 */
function errorHandler(err, req, res, next) {
  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  // Mongoose CastError: invalid ObjectId format
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      error: `Invalid id format: ${err.value}`,
    });
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    return res.status(409).json({
      success: false,
      error: `Duplicate value: ${field} "${value}" already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Token expired. Please login again." });
  }

  // Lỗi từ service (throw err với statusCode)
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Không expose stack trace trong production
  const response = {
    success: false,
    error: message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFoundHandler, errorHandler };
