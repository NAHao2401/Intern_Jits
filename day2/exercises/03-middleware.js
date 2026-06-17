/**
 * Bài tập 3 - Middleware
 * Day 2 - Express.js & REST API
 *
 * Mục tiêu:
 * - Hiểu middleware pipeline và thứ tự thực thi
 * - Viết custom middleware: logger, auth, validator, rate limiter
 * - Xử lý lỗi đúng chuẩn với error middleware
 * - Hiểu khi nào gọi next() và khi nào không
 *
 * Chạy: node 03-middleware.js
 * Test: curl http://localhost:3003/...
 */

const express = require("express");
const app = express();
const PORT = 3003;

app.use(express.json());

// ============================================================
// 3.1: Hiểu thứ tự middleware (đọc hiểu, không cần implement)
// ============================================================

/**
 * Câu hỏi tư duy - Trả lời trong comment:
 *
 * Q1: Middleware A gọi next(), Middleware B KHÔNG gọi next().
 *     Route handler có được thực thi không? Tại sao?
 * A1: Route handler sẽ KHÔNG được thực thi vì middleware B không gọi next()
 *
 * Q2: Nếu middleware gọi res.json() mà KHÔNG gọi next(),
 *     các middleware phía sau có chạy không?
 * A2: Các middleware phía sau sẽ KHÔNG chạy vì response đã được gửi đi và không có next() để tiếp tục pipeline
 *
 * Q3: Error middleware có 4 tham số (err, req, res, next).
 *     Làm sao để "kích hoạt" error middleware từ route handler?
 * A3: Để kích hoạt error middleware, ta có thể gọi next(err) với err là một instance của Error hoặc AppError
 *
 * Q4: Middleware khai báo sau app.use("/api", router) có chạy cho route /api/users không?
 * A4: Thông thường là không, nếu router đã xử lý xong response và không gọi next().
 *     Middleware trong Express chạy theo đúng thứ tự khai báo.
 *     Nếu router hoặc route bên trong router gọi next(), middleware phía sau vẫn có thể chạy
 *
 * Q5: Global middleware khai báo SAU route definition có áp dụng cho route đó không?
 * A5: Không áp dụng cho các request đã được route phía trước xử lý xong
 *     Express chạy middleware/route theo thứ tự từ trên xuống dưới
 *     Muốn global middleware áp dụng cho mọi route thì phải khai báo nó trước các route
 *
 * Demo thứ tự (chạy và quan sát log):
 */

function demoMiddlewareOrder() {
  const demoApp = express();

  demoApp.use((req, res, next) => {
    console.log("Middleware 1 - trước route");
    next();
  });

  demoApp.get("/demo", (req, res, next) => {
    console.log("Route handler");
    next(); // có thể gọi next() trong route để tiếp tục
  });

  demoApp.use((req, res, next) => {
    console.log("Middleware 2 - sau route");
    res.json({ message: "Response từ Middleware 2" });
  });

  // Uncomment để test:
  // const server = demoApp.listen(3099, () => console.log("Demo on 3099"));
  // setTimeout(() => server.close(), 5000);
}

// ============================================================
// 3.2: Logger Middleware
// ============================================================

/**
 * TODO: Implement requestLogger middleware
 *
 * Yêu cầu:
 * 1. Log format: [TIMESTAMP] METHOD PATH - khi request đến
 * 2. Log format: [TIMESTAMP] METHOD PATH STATUS DURATIONms - khi response xong
 * 3. Dùng res.on("finish", ...) để log sau khi response gửi đi
 * 4. Thêm header X-Request-ID với giá trị unique cho mỗi request
 *
 * Ví dụ output:
 * [2024-01-15T10:30:00.000Z] --> GET /api/users
 * [2024-01-15T10:30:00.015Z] <-- GET /api/users 200 15ms
 */
function requestLogger(req, res, next) {
  // TODO: implement logger
  // Hint:
  const start = Date.now();
  const timestamp = () => new Date().toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  req.id = requestId;
  res.set("X-Request-ID", requestId);
  console.log(`[${timestamp()}] --> ${req.method} ${req.path}`);
  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `[${timestamp()}] <-- ${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
}

// ============================================================
// 3.3: Authentication Middleware
// ============================================================

/**
 * TODO: Implement authenticate middleware
 *
 * Yêu cầu:
 * 1. Đọc header "Authorization" với format "Bearer <token>"
 * 2. Nếu không có header -> 401 { error: "No token provided" }
 * 3. Nếu format sai (không phải "Bearer ...") -> 401 { error: "Invalid token format" }
 * 4. Extract token từ header, check với danh sách validTokens
 * 5. Nếu token không hợp lệ -> 401 { error: "Invalid or expired token" }
 * 6. Nếu hợp lệ -> gán req.user = user tương ứng, gọi next()
 *
 * validTokens là object mô phỏng JWT verification:
 * key = token string, value = user object
 */

const validTokens = {
  "token-alice-123": { id: 1, name: "Alice", role: "admin" },
  "token-bob-456": { id: 2, name: "Bob", role: "user" },
  "token-charlie-789": { id: 3, name: "Charlie", role: "user" },
};

function authenticate(req, res, next) {
  // TODO: implement authentication middleware
  // Hint: req.get("Authorization") hoặc req.headers.authorization
  // Hint: header.startsWith("Bearer ") để check format
  // Hint: header.slice(7) để lấy token sau "Bearer "
  // Lấy Authorization header

  const header = req.get("Authorization");

  if (!header) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Invalid token format",
    });
  }

  const token = header.slice(7);

  const user = validTokens[token];

  if (!user) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }

  req.user = user;

  next();
}

// ============================================================
// 3.4: Authorization Middleware (Role-based)
// ============================================================

/**
 * TODO: Implement authorize middleware factory
 *
 * authorize(roles) nhận vào array of roles được phép
 * Trả về middleware function
 *
 * Yêu cầu:
 * 1. Phải chạy SAU authenticate (req.user đã được set)
 * 2. Nếu req.user.role không trong danh sách roles -> 403 { error: "Insufficient permissions" }
 * 3. Nếu role hợp lệ -> gọi next()
 *
 * Dùng: app.delete("/admin/users/:id", authenticate, authorize(["admin"]), handler)
 */
function authorize(roles) {
  return (req, res, next) => {
    // TODO: implement authorization
    // Hint: roles.includes(req.user.role)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

// ============================================================
// 3.5: Validation Middleware
// ============================================================

/**
 * TODO: Implement validateBody middleware factory
 *
 * validateBody(schema) nhận vào object mô tả schema:
 * {
 *   fieldName: {
 *     required: boolean,
 *     type: "string" | "number" | "boolean",
 *     minLength: number (cho string),
 *     maxLength: number (cho string),
 *     min: number (cho number),
 *     max: number (cho number),
 *   }
 * }
 *
 * Trả về middleware validate req.body theo schema
 * Nếu có lỗi -> 400 { error: "Validation failed", details: [<mảng lỗi>] }
 * Nếu OK -> gọi next()
 *
 * Ví dụ dùng:
 * app.post("/products", validateBody({
 *   name: { required: true, type: "string", minLength: 2, maxLength: 100 },
 *   price: { required: true, type: "number", min: 0 },
 *   category: { required: false, type: "string" },
 * }), createProduct);
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    // TODO: implement validation logic
    // Duyệt qua từng field trong schema
    // Check required, type, minLength/maxLength, min/max
    // Push lỗi vào errors array
    // Ví dụ lỗi: "name is required", "price must be a number", "name must be at least 2 characters"

    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
        continue;
      }

      if (rules.type === "string") {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push(
            `${field} must be at least ${rules.minLength} characters`,
          );
        }

        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }

      if (rules.type === "number") {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    next();
  };
}

// ============================================================
// 3.6: Rate Limiter Middleware
// ============================================================

/**
 * TODO: Implement rateLimiter middleware factory
 *
 * rateLimiter({ windowMs, max }) giới hạn số request trong khoảng thời gian
 * - windowMs: khoảng thời gian (ms)
 * - max: số request tối đa trong windowMs
 *
 * Yêu cầu:
 * 1. Track request count theo IP (dùng req.ip hoặc req.socket.remoteAddress)
 * 2. Nếu vượt quá giới hạn -> 429 Too Many Requests
 * 3. Thêm headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 * 4. Reset counter sau windowMs
 *
 * Hint: Dùng Map để lưu { ip -> { count, resetTime } }
 */
function rateLimiter({ windowMs = 60000, max = 10 } = {}) {
  const clients = new Map(); // ip -> { count, resetTime }

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress;
    const now = Date.now();

    // TODO: implement rate limiting
    // 1. Lấy record của IP từ clients Map
    // 2. Nếu chưa có hoặc đã qua resetTime -> khởi tạo mới: { count: 1, resetTime: now + windowMs }
    // 3. Nếu count < max -> tăng count, set headers, gọi next()
    // 4. Nếu count >= max -> trả về 429

    // Set rate limit headers
    // res.set("X-RateLimit-Limit", max);
    // res.set("X-RateLimit-Remaining", Math.max(0, max - clientRecord.count));
    // res.set("X-RateLimit-Reset", new Date(clientRecord.resetTime).toISOString());

    let clientRecord = clients.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      clientRecord = {
        count: 1,
        resetTime: now + windowMs,
      };

      clients.set(ip, clientRecord);
    } else {
      clientRecord.count += 1;
    }

    res.set("X-RateLimit-Limit", max);
    res.set("X-RateLimit-Remaining", Math.max(0, max - clientRecord.count));
    res.set(
      "X-RateLimit-Reset",
      new Date(clientRecord.resetTime).toISOString(),
    );

    if (clientRecord.count > max) {
      return res.status(429).json({
        error: "Too many requests",
      });
    }

    next();
  };
}

// ============================================================
// 3.7: Error Handling Middleware
// ============================================================

/**
 * TODO: Implement các error class và error middleware
 *
 * Custom errors với statusCode:
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * TODO: Implement errorHandler middleware
 *
 * Yêu cầu:
 * 1. Log lỗi ra console (kèm stack trace)
 * 2. Nếu err là instance của AppError -> dùng err.statusCode và err.code
 * 3. Nếu err.name === "SyntaxError" (JSON parse error) -> 400 Bad Request
 * 4. Các lỗi khác -> 500 Internal Server Error
 * 5. Response format: { success: false, error: message, code: <error code> }
 * 6. Trong development: thêm stack vào response
 */
function errorHandler(err, req, res, next) {
  // TODO: implement error handler
  console.error("[ERROR]", err.stack || err);

  // Xử lý JSON parse error từ express.json()
  if (err.type === "entity.parse.failed" || err.name === "SyntaxError") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
      code: "INVALID_JSON",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // TODO: xử lý AppError và các loại lỗi khác
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_ERROR";

  // Xử lý lỗi do mình tự định nghĩa
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Xử lý các lỗi không xác định khác
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// ============================================================
// 3.8: Routes để test các middleware
// ============================================================

// Apply global middleware
app.use(requestLogger);

// Public routes
app.get("/public", (req, res) => {
  res.json({ message: "Public endpoint - no auth needed" });
});

// Rate limited endpoint (3 requests per 10 seconds for testing)
app.get("/limited", rateLimiter({ windowMs: 10000, max: 3 }), (req, res) => {
  res.json({ message: "You passed the rate limit!", requestId: req.id });
});

// Protected routes
app.get("/protected", authenticate, (req, res) => {
  res.json({ message: `Hello, ${req.user?.name}!`, user: req.user });
});

app.get("/admin-only", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Admin area", user: req.user });
});

// Product creation with validation
const productSchema = {
  name: { required: true, type: "string", minLength: 2, maxLength: 100 },
  price: { required: true, type: "number", min: 0 },
  category: { required: false, type: "string" },
  inStock: { required: false, type: "boolean" },
};

app.post("/products", authenticate, validateBody(productSchema), (req, res) => {
  // Nếu validate pass -> tạo product
  res.status(201).json({
    message: "Product created (mock)",
    product: { id: Math.floor(Math.random() * 1000), ...req.body },
  });
});

// Route throw error để test error middleware
app.get("/throw/:type", (req, res, next) => {
  const { type } = req.params;

  switch (type) {
    case "notfound":
      return next(new NotFoundError("Product"));
    case "validation":
      return next(new ValidationError("Name cannot be empty"));
    case "unauthorized":
      return next(new UnauthorizedError());
    case "generic":
      return next(new Error("Unexpected error occurred"));
    case "sync":
      throw new Error("Synchronous error"); // Express 5 bắt được, Express 4 thì không
    default:
      return res.json({ message: "No error thrown" });
  }
});

// Route async error
app.get("/async-error", async (req, res, next) => {
  try {
    // Mô phỏng async operation thất bại
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection failed")), 100),
    );
  } catch (err) {
    next(err); // Phải gọi next(err) trong async handler
  }
});

// 404 handler - trước error handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// Error middleware - PHẢI đặt cuối
app.use(errorHandler);

// ============================================================
// Start server
// ============================================================

app.listen(PORT, () => {
  console.log(`Middleware server running on http://localhost:${PORT}`);
  console.log("\nTest middleware:");
  console.log(`  curl http://localhost:${PORT}/public`);
  console.log(
    `  curl http://localhost:${PORT}/limited (gọi 4 lần để test rate limit)`,
  );
  console.log(`  curl http://localhost:${PORT}/protected`);
  console.log(
    `  curl http://localhost:${PORT}/protected -H "Authorization: Bearer token-alice-123"`,
  );
  console.log(
    `  curl http://localhost:${PORT}/admin-only -H "Authorization: Bearer token-bob-456"`,
  );
  console.log(
    `  curl http://localhost:${PORT}/admin-only -H "Authorization: Bearer token-alice-123"`,
  );
  console.log(
    `  curl -X POST http://localhost:${PORT}/products -H "Authorization: Bearer token-alice-123" -H "Content-Type: application/json" -d '{"name":"Laptop","price":25000000}'`,
  );
  console.log(
    `  curl -X POST http://localhost:${PORT}/products -H "Authorization: Bearer token-alice-123" -H "Content-Type: application/json" -d '{"price":-1}'`,
  );
  console.log(`  curl http://localhost:${PORT}/throw/notfound`);
  console.log(`  curl http://localhost:${PORT}/throw/validation`);
  console.log(`  curl http://localhost:${PORT}/async-error`);
  console.log(`  curl http://localhost:${PORT}/unknown-route`);
});
