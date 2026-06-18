const jwt = require("jsonwebtoken");

/**
 * TODO: Implement validate middleware (copy từ bài tập 1)
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    // TODO: implement
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", details });
    }
    req[source] = value;
    next();
  };
}

/**
 * TODO: Implement authenticate middleware (copy từ bài tập 2)
 * - Đọc Authorization: Bearer <token>
 * - Verify JWT
 * - req.user = decoded
 */
function authenticate(req, res, next) {
  // TODO: implement
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
}

/**
 * TODO: Implement authorize factory (copy từ bài tập 2)
 */
function authorize(...roles) {
  return (req, res, next) => {
    // TODO: implement
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }
    next();
  };
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, error: "Invalid JSON" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = {
  validate,
  authenticate,
  authorize,
  notFoundHandler,
  errorHandler,
};
