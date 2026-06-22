/**
 * Day 5 - Exercise 03: Mongoose Error Handling
 *
 * Mục tiêu:
 *   - Nhận diện và xử lý đúng 3 loại Mongoose error:
 *       1. CastError       (invalid ObjectId)      -> 400
 *       2. ValidationError (schema validation fail) -> 400 với details
 *       3. MongoServerError code 11000 (duplicate)  -> 409
 *   - Xử lý "not found" khi document không tồn tại -> 404
 *   - Không expose Mongoose internals ra client
 *
 * Chạy:
 *   node exercises/03-error-handling/index.js
 *
 * Test (dùng curl hoặc Postman sau khi server start):
 *   curl http://localhost:3003/users                   -> 200, list users
 *   curl http://localhost:3003/users/bad-id            -> 400, invalid id
 *   curl http://localhost:3003/users/507f1f77bcf86cd799439011 -> 404, not found
 *   curl -X POST http://localhost:3003/users -H "Content-Type: application/json" \
 *        -d '{"name":"Alice","email":"alice@example.com"}' -> 201
 *   curl -X POST http://localhost:3003/users -H "Content-Type: application/json" \
 *        -d '{"name":"Alice","email":"alice@example.com"}' -> 409, duplicate
 *   curl -X POST http://localhost:3003/users -H "Content-Type: application/json" \
 *        -d '{"name":"A","email":"not-email"}' -> 400, validation error
 */

"use strict";
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ─── Model ────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Email is not valid"],
  },
  age: {
    type: Number,
    min: [0, "Age cannot be negative"],
    max: [150, "Age is not realistic"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "moderator"],
      message: '"{VALUE}" is not a valid role',
    },
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /users — list all users
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /users/:id — get user by id
// Sẽ throw CastError nếu id không phải ObjectId hợp lệ
// Sẽ trả 404 nếu không tìm thấy
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    // TODO 3.4: Nếu user === null, throw error với statusCode 404
    // Gợi ý:
    //   if (!user) {
    //     const err = new Error("User not found");
    //     err.statusCode = 404;
    //     throw err; // hoặc return next(err);
    //   }
    // Câu hỏi: tại sao findById không tự throw 404 mà trả về null?
    if (!user) {
      const err = new Error("User not found");
      err.statusCode(404);
      throw err;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// POST /users — create user
// Có thể throw: ValidationError (schema fail) hoặc MongoServerError 11000 (duplicate email)
app.post("/users", async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /users/:id — update user
app.put("/users/:id", async (req, res, next) => {
  try {
    // Note: Dùng findById + save để Mongoose validation chạy
    // findByIdAndUpdate bỏ qua validation mặc định!
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    Object.assign(user, req.body);
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// DELETE /users/:id — delete user
app.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

// ─── TODO 3.1: Handle CastError ───────────────────────────────────────────────
//
// CastError xảy ra khi mongoose cố cast giá trị sang sai kiểu.
// Phổ biến nhất: ID không phải ObjectId hợp lệ.
//
// Trigger: GET /users/bad-id (hoặc bất kỳ string nào không phải ObjectId 24 hex chars)
//
// Kết quả mong muốn:
//   HTTP 400
//   { "success": false, "error": "Invalid ID format: \"bad-id\"" }
//
// Nhận diện: err.name === "CastError" && err.kind === "ObjectId"
//
// Thêm handler này vào errorHandler middleware bên dưới.
// Gợi ý:
//   if (err.name === "CastError" && err.kind === "ObjectId") {
//     statusCode = 400;
//     message = `Invalid ID format: "${err.value}"`;
//   }

// ─── TODO 3.2: Handle ValidationError ────────────────────────────────────────
//
// ValidationError xảy ra khi document fail schema validation.
//
// Trigger:
//   POST /users  body: { "name": "A", "email": "not-email", "age": -5 }
//
// Kết quả mong muốn:
//   HTTP 400
//   {
//     "success": false,
//     "error": "Validation failed",
//     "details": [
//       { "field": "name", "message": "Name must be at least 2 characters" },
//       { "field": "email", "message": "Email is not valid" },
//       { "field": "age", "message": "Age cannot be negative" }
//     ]
//   }
//
// Nhận diện: err.name === "ValidationError"
// err.errors là object: { fieldName: ValidationErrorItem }
// Mỗi ValidationErrorItem có: .path (tên field), .message (error message)
//
// Gợi ý:
//   if (err.name === "ValidationError") {
//     statusCode = 400;
//     message = "Validation failed";
//     details = Object.values(err.errors).map(e => ({
//       field: e.path,
//       message: e.message,
//     }));
//   }

// ─── TODO 3.3: Handle duplicate key (code 11000) ──────────────────────────────
//
// MongoServerError code 11000 xảy ra khi insert document vi phạm unique index.
//
// Trigger:
//   POST /users  body: { "name": "Alice", "email": "alice@example.com" }  (lần 2)
//
// Kết quả mong muốn:
//   HTTP 409 Conflict
//   { "success": false, "error": "email already exists" }
//
// Nhận diện: err.code === 11000
// err.keyValue là object: { fieldName: value } — lấy field name từ đây
//
// Gợi ý:
//   if (err.code === 11000) {
//     statusCode = 409;
//     const field = Object.keys(err.keyValue)[0];
//     message = `${field} already exists`;
//   }

// ─── TODO 3.5: Global Error Handler Middleware ───────────────────────────────
//
// Kết hợp tất cả TODO 3.1, 3.2, 3.3 vào một error middleware.
//
// Yêu cầu:
//   1. Nhận diện đúng loại error (CastError, ValidationError, 11000, custom statusCode)
//   2. Trả đúng HTTP status code
//   3. Message rõ ràng, không expose Mongoose internals
//   4. Trong development: có thể thêm stack trace
//   5. KHÔNG trả nguyên err.message của Mongoose (có thể chứa schema details)
//
// Cấu trúc:
//   app.use((err, req, res, next) => {
//     let statusCode = err.statusCode || 500;
//     let message = "Internal Server Error";
//     let details = null;
//
//     // TODO 3.1: CastError handler
//
//     // TODO 3.2: ValidationError handler
//
//     // TODO 3.3: Duplicate key handler
//
//     // Custom errors (có statusCode) — ví dụ: 404 từ route handler
//     if (err.statusCode && !isMongooseError) {
//       message = err.message;
//     }
//
//     const response = { success: false, error: message };
//     if (details) response.details = details;
//     if (process.env.NODE_ENV === "development") response.stack = err.stack;
//
//     res.status(statusCode).json(response);
//   });
//
// Implement error middleware bên dưới đây:

// TODO 3.5 — Error Handler Middleware:
app.use((err, req, res, next) => {
  // Implement error handling logic ở đây
  // Hiện tại: pass-through để thấy raw error (xấu)

  let statusCode = err.statusCode || 500;
  let message = "Internal Server Error";
  let details = null;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}`;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";

    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  } else if (err.statusCode) {
    message = err.message;
  }

  const response = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// ─── Server startup ───────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Seed: tạo 1 user để test duplicate
    await User.deleteMany({});
    await User.create({ name: "Alice Smith", email: "alice@example.com" });
    console.log(
      'Seeded: user "alice@example.com" exists (use for duplicate test)',
    );

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log();
      console.log("Test commands:");
      console.log(`  # 200 — list users`);
      console.log(`  curl http://localhost:${PORT}/users`);
      console.log();
      console.log(`  # 400 — invalid ObjectId (TODO 3.1)`);
      console.log(`  curl http://localhost:${PORT}/users/bad-id`);
      console.log();
      console.log(`  # 404 — valid ObjectId but not found (TODO 3.4)`);
      console.log(
        `  curl http://localhost:${PORT}/users/507f1f77bcf86cd799439011`,
      );
      console.log();
      console.log(`  # 400 — validation error (TODO 3.2)`);
      console.log(`  curl -X POST http://localhost:${PORT}/users \\`);
      console.log(`       -H "Content-Type: application/json" \\`);
      console.log(`       -d '{"name":"A","email":"not-email","age":-1}'`);
      console.log();
      console.log(`  # 201 — create success`);
      console.log(`  curl -X POST http://localhost:${PORT}/users \\`);
      console.log(`       -H "Content-Type: application/json" \\`);
      console.log(`       -d '{"name":"Bob Tran","email":"bob@example.com"}'`);
      console.log();
      console.log(`  # 409 — duplicate email (TODO 3.3)`);
      console.log(`  curl -X POST http://localhost:${PORT}/users \\`);
      console.log(`       -H "Content-Type: application/json" \\`);
      console.log(`       -d '{"name":"Alice2","email":"alice@example.com"}'`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

startServer();

// ─────────────────────────────────────────────────────────────────────────────
// CÂUHỎI TƯ DUY
// ─────────────────────────────────────────────────────────────────────────────
//
// Q1: Tại sao KHÔNG nên return nguyên err.message của Mongoose ra client?
//     (Gợi ý: ValidationError message tiết lộ thông tin gì về schema?)
//
//     YOUR ANSWER: Vì message gốc của Mongoose có thể lộ thông tin nội bộ như tên model, tên field, rule validation, ... Client chỉ nên nhận message rõ ràng
//
// Q2: Khi nào dùng err.statusCode custom (throw từ service) vs Mongoose error?
//     Viết một ví dụ cho mỗi loại:
//
//     Custom statusCode error: Dùng khi lỗi do logic nghiệp vụ mình tự xác định
//     Mongoose error: dùng khi lỗi phát sinh từ Mongoose/MongoDB
//
// Q3: findByIdAndUpdate mặc định KHÔNG chạy Mongoose schema validation.
//     Cách làm cho nó validate: có thể thêm runValidators: true vào
//     Tại sao đây không phải cách tốt nhất để update password?
//
//     YOUR ANSWER: vì update password không nên làm đơn giản như vậy, password thường cần xử lý thêm hash bằng bcrypt trước khi lưu
//
// Q4: Nếu user gửi id hợp lệ về format ObjectId (24 hex) nhưng không tồn tại
//     trong DB, Mongoose throw gì? Bạn phải xử lý ở đâu?
//
//     YOUR ANSWER: Mongoose không throw lỗi. Nó trả về null, nên xử lý ngay trong route
//
// ─────────────────────────────────────────────────────────────────────────────
