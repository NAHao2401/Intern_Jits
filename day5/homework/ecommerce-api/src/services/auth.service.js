/**
 * Auth Service
 *
 * Dùng User.findByEmail() static method và user.comparePassword() instance method
 * Pattern: throw error với .statusCode property, controller gọi next(err)
 */

"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Tạo JWT token cho user.
 * @param {Document} user - Mongoose User document
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Đăng ký user mới.
 *
 * TODO AUTH-1: Implement register logic
 *   1. Kiểm tra email đã tồn tại chưa — dùng User.findByEmail(email)
 *      Nếu tồn tại: throw error statusCode 409 "Email already in use"
 *   2. Tạo user mới: User.create({ firstName, lastName, email, password, role })
 *      pre("save") hook sẽ tự hash password
 *   3. Generate token bằng generateToken(user)
 *   4. Return { user: user.toSafeObject(), token }
 *
 * Hint:
 *   const existingUser = await User.findByEmail(data.email);
 *   if (existingUser) { ... }
 *   const user = await User.create(data);
 *   const token = generateToken(user);
 *
 * @param {{ firstName, lastName, email, password, role? }} data
 * @returns {Promise<{ user, token }>}
 */
async function register(data) {
  // TODO AUTH-1
  const existingUser = await User.findByEmail(data.email);
  if (existingUser) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create(data);
  const token = generateToken(user);
  return {
    user: user.toSafeObject(),
    token,
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Đăng nhập user.
 *
 * TODO AUTH-2: Implement login logic
 *   1. Tìm user theo email — dùng User.findByEmail(email)
 *      Nếu không tìm thấy: throw error statusCode 401 "Invalid credentials"
 *      (Không nói rõ email hay password sai — security best practice)
 *   2. Kiểm tra password — dùng user.comparePassword(password)
 *      Nếu không khớp: throw error statusCode 401 "Invalid credentials"
 *   3. Kiểm tra user active
 *      Nếu isActive === false: throw error statusCode 403 "Account is deactivated"
 *   4. Generate token, return { user: user.toSafeObject(), token }
 *
 * Hint:
 *   const user = await User.findByEmail(email);
 *   if (!user) { ... }
 *   const isMatch = await user.comparePassword(password);
 *   if (!isMatch) { ... }
 *
 * @param {{ email, password }} credentials
 * @returns {Promise<{ user, token }>}
 */
async function login({ email, password }) {
  // TODO AUTH-2
  const user = await User.findByEmail(email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Account is deactivated");
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token,
  };
}

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * Lấy thông tin user hiện tại từ token.
 *
 * TODO AUTH-3: Implement getMe logic
 *   1. Tìm user theo userId — dùng User.findById(userId)
 *   2. Nếu không tìm thấy: throw error statusCode 404 "User not found"
 *   3. Return user.toSafeObject() (không có password)
 *
 * Hint:
 *   const user = await User.findById(userId);
 *   if (!user) { ... }
 *   return user.toSafeObject();
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getMe(userId) {
  // TODO AUTH-3
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    user: user.toSafeObject(),
  };
}

module.exports = { register, login, getMe };
