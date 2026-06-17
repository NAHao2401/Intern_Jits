/**
 * Custom Middleware
 * Day 2 - Exercise 04
 */

// ============================================================
// Request Logger
// ============================================================

function requestLogger(req, res, next) {
  const start = Date.now();
  const timestamp = () => new Date().toISOString();

  // Gán request ID
  req.id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  res.set("X-Request-ID", req.id);

  console.log(`[${timestamp()}] --> ${req.method} ${req.path}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? "ERROR" :
                        res.statusCode >= 400 ? "WARN " : "OK   ";
    console.log(`[${timestamp()}] [${statusColor}] <-- ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

// ============================================================
// Validate Body
// ============================================================

/**
 * Middleware factory để validate request body
 * @param {Object} schema - Mô tả các field cần validate
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue; // skip các check khác nếu field không có
      }

      // Nếu không required và không có value, bỏ qua
      if (value === undefined || value === null) continue;

      // Check type
      if (rules.type === "string" && typeof value !== "string") {
        errors.push(`${field} must be a string`);
      }
      if (rules.type === "number" && (typeof value !== "number" || isNaN(value))) {
        errors.push(`${field} must be a number`);
      }
      if (rules.type === "boolean" && typeof value !== "boolean") {
        errors.push(`${field} must be a boolean`);
      }

      // Check string constraints
      if (typeof value === "string") {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }

      // Check number constraints
      if (typeof value === "number") {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }

      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
}

// ============================================================
// 404 Handler
// ============================================================

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
    code: "NOT_FOUND",
  });
}

// ============================================================
// Error Handler
// ============================================================

function errorHandler(err, req, res, next) {
  // Log lỗi
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
      code: "INVALID_JSON",
    });
  }

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_ERROR";

  res.status(status).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = { requestLogger, validateBody, notFoundHandler, errorHandler };
