/**
 * models/index.js
 * Setup MongoDB connection + export tất cả models
 *
 * Pattern này giúp:
 * - Import một chỗ duy nhất thay vì require mongoose ở nhiều file
 * - Tất cả models được load trước khi dùng (tránh lỗi "Schema hasn't been registered")
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");

const User = require("./user.model");
const Post = require("./post.model");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.connection.close();
  console.log("MongoDB disconnected");
}

module.exports = {
  connectDB,
  disconnectDB,
  User,
  Post,
};
