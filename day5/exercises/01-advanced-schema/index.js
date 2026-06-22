/**
 * Day 5 - Exercise 01: Advanced Mongoose Schema
 *
 * Mục tiêu:
 *   - Viết pre("save") hook để auto-hash password
 *   - Implement instance method: comparePassword()
 *   - Implement static method: findByEmail()
 *   - Implement virtual: fullName
 *   - Hiểu khi nào dùng Mongoose validation vs Joi validation
 *
 * Yêu cầu: MongoDB đang chạy tại MONGODB_URI trong .env
 *
 * Chạy: node exercises/01-advanced-schema/index.js
 */

"use strict";
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ─── Schema Definition ────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email is not valid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Cần option này để virtuals xuất hiện khi res.json() / JSON.stringify()
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── TODO 1.1: pre("save") hook — auto hash password ─────────────────────────
//
// Yêu cầu:
//   - Chỉ hash khi password bị thay đổi (dùng this.isModified("password"))
//   - Dùng bcrypt.hash() với saltRounds = 10
//   - Gán hash vào this.password trước khi gọi next()
//   - Dùng function() không phải arrow function (cần "this")
//
// Gợi ý cấu trúc:
//   userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     // ... hash ở đây
//     next();
//   });
//
// Câu hỏi: Tại sao pre("save") KHÔNG chạy khi dùng findByIdAndUpdate()?
// Trả lời bằng comment bên dưới trước khi code:
// YOUR ANSWER: Vì pre("save") là document middleware, chỉ chạy khi gọi .save() trên một document cụ thể, còn findByIdAndUpdate() là query middleware, nó update trực tiếp trên database, khôn gọi document.save() nên pre("save") sẽ không chạy

// TODO 1.1 — Implement pre("save") hook bên dưới dòng này:
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// ─── TODO 1.2: Instance method — comparePassword() ───────────────────────────
//
// Yêu cầu:
//   - Method tên: comparePassword(plaintext)
//   - Nhận plaintext password, so sánh với this.password (đã hash)
//   - Return: Promise<boolean> (true nếu khớp, false nếu không)
//   - Dùng bcrypt.compare()
//   - PHẢI dùng function() không phải arrow function
//
// Gợi ý:
//   userSchema.methods.comparePassword = async function (plaintext) {
//     return bcrypt.compare(plaintext, this.password);
//   };
//
// Câu hỏi: Tại sao không so sánh bcrypt.hash(plaintext) === this.password?
// YOUR ANSWER: Vì bcrypt dùng salt, mỗi lần hash cùng một plaintext password kết quả hash có thể khác nhau. Vì vậy phải dùng .compare() vì hàm này tự biết lấy salt trong hash cũ để kiểm tra

// TODO 1.2 — Implement instance method bên dưới:
userSchema.methods.comparePassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.password);
};

// ─── TODO 1.3: Static method — findByEmail() ─────────────────────────────────
//
// Yêu cầu:
//   - Method tên: findByEmail(email)
//   - Tìm user theo email (case-insensitive — convert về lowercase)
//   - Return: Promise<Document | null>
//   - Dùng this.findOne() (this = Model trong static)
//
// Gợi ý:
//   userSchema.statics.findByEmail = function (email) {
//     return this.findOne({ email: email.toLowerCase() });
//   };
//
// Câu hỏi: Tại sao đây là static method thay vì instance method?
// YOUR ANSWER: Vì khi tìm user theo email, ta chưa có document cụ thể, ta đang gọi từ Model User để tìm trong collection users. Instance method chỉ dùng được khi đã có một user document rồi

// TODO 1.3 — Implement static method bên dưới:
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// ─── TODO 1.4: Virtual — fullName ─────────────────────────────────────────────
//
// Yêu cầu:
//   - Virtual tên: fullName
//   - Getter: trả về `${firstName} ${lastName}`
//   - Virtual KHÔNG được lưu vào DB
//   - Dùng function() không phải arrow function
//
// Gợi ý:
//   userSchema.virtual("fullName").get(function () {
//     return `${this.firstName} ${this.lastName}`;
//   });
//
// Để verify: sau khi tạo user, log ra user.fullName và user.toJSON()
//   kiểm tra fullName có xuất hiện không
//
// Câu hỏi: Sự khác nhau giữa toJSON: { virtuals: true } và toObject: { virtuals: true }?
// YOUR ANSWER:
//   - toJson: {virtuals: true} giúp virtual field xuất hiện khi convert document sang JSON
//   - toObject: {virtuals: true} giúp virtual field xuất hiện khi gọi user.toObject().

// TODO 1.4 — Implement virtual bên dưới:
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── Model ────────────────────────────────────────────────────────────────────

const User = mongoose.model("User", userSchema);

// ─── TODO 1.5: Test cases ─────────────────────────────────────────────────────
//
// Viết code test các tính năng trên. Mỗi test cần log kết quả rõ ràng.
//
// Test 1: Tạo user mới
//   - Tạo user với password "password123"
//   - Log ra user.password — phải là bcrypt hash, KHÔNG phải "password123"
//   - Log ra user.fullName — phải là "firstName lastName"
//   - Log ra user.toJSON() — phải có fullName, KHÔNG có __v
//
// Test 2: comparePassword
//   - Dùng user.comparePassword("password123") -> phải trả true
//   - Dùng user.comparePassword("wrongpassword") -> phải trả false
//
// Test 3: Static method findByEmail
//   - Dùng User.findByEmail(email) -> phải tìm được user vừa tạo
//   - Dùng User.findByEmail("UPPERCASE@EMAIL.COM") -> vẫn tìm được (case insensitive)
//
// Test 4: Update password (hook phải chạy lại)
//   - Fetch user từ DB bằng User.findById()
//   - Gán user.password = "newpassword456"
//   - Gọi user.save()
//   - comparePassword("newpassword456") -> true
//   - comparePassword("password123") -> false (password cũ không còn dùng được)
//
// Test 5: Duplicate email
//   - Thử tạo user với email đã tồn tại
//   - Catch error và log err.code (phải là 11000)
//
// Gợi ý cấu trúc:
//   async function runTests() {
//     await mongoose.connect(process.env.MONGODB_URI);
//     await User.deleteMany({}); // clean slate
//
//     console.log("\n=== Test 1: Create User ===");
//     // ... test code
//
//     await mongoose.disconnect();
//   }
//   runTests().catch(console.error);

// TODO 1.5 — Implement test function bên dưới:
async function runTests() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  try {
    await User.deleteMany({});

    await User.init();

    console.log("\n=== Test 1: Create User ===");

    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      role: "user",
    });

    console.log("Saved password:", user.password);
    console.log("Password is hashed:", user.password !== "password123");
    console.log("Full name:", user.fullName);
    console.log("User JSON:", user.toJSON());

    console.log("\n=== Test 2: comparePassword ===");

    const correctPassword = await user.comparePassword("password123");
    const wrongPassword = await user.comparePassword("wrongpassword");

    console.log("Compare with correct password:", correctPassword);
    console.log("Compare with wrong password:", wrongPassword);

    console.log("\n=== Test 3: Static method findByEmail ===");

    const foundUser = await User.findByEmail("john.doe@example.com");
    console.log(
      "Found user by normal email:",
      foundUser ? foundUser.email : null,
    );

    const foundUserUppercase = await User.findByEmail("JOHN.DOE@EXAMPLE.COM");
    console.log(
      "Found user by uppercase email:",
      foundUserUppercase ? foundUserUppercase.email : null,
    );

    console.log("\n=== Test 4: Update password ===");

    const userToUpdate = await User.findById(user._id);

    userToUpdate.password = "newpassword456";
    await userToUpdate.save();

    const newPasswordValid =
      await userToUpdate.comparePassword("newpassword456");
    const oldPasswordValid = await userToUpdate.comparePassword("password123");

    console.log("Compare with new password:", newPasswordValid);
    console.log("Compare with old password:", oldPasswordValid);

    console.log("\n=== Test 5: Duplicate email ===");

    try {
      await User.create({
        firstName: "Jane",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      });
    } catch (err) {
      console.log("Duplicate email error code:", err.code);
      console.log("Is duplicate key error:", err.code === 11000);
    }
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB disconnected");
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// CÂUHỎI TƯ DUY (trả lời bằng comment trước khi nộp bài)
// ─────────────────────────────────────────────────────────────────────────────
//
// Q1: Khi nào dùng Mongoose validation (schema level) vs Joi validation?
//     Gợi ý: Nghĩ về: layer nào chịu trách nhiệm, duplicate logic, performance
//
//     Mongoose validation: Dùng ở tầng database/model để bảo vệ dữ liệu trước khi lưu vào MongoDB
//     Joi validation: Dùng ở tầng request/controller/middleware để validate dữ liệu đầu vào từ client trước khi đi vào service hoặc database
//     Kết luận dùng cái nào khi nào: Nên dùng Joi để validate input từ client ở API layer. Nên dùng Mogoose validation để đảm bảo tính toàn vẹn dữ liệu ở model layer.
//
// Q2: Nếu một service gọi User.create() và Mongoose validation fail,
//     error đó có tự động reach error middleware không?
//     Phải làm gì trong controller/service để xử lý đúng?
//
//     YOUR ANSWER: Không tự động reach error middleware nếu mình không truyền lỗi đó cho Express. Trong controller async, cần dùng try/catch rồi gọi next(err)
// Q3: pre("save") chạy khi nào? Liệt kê các trường hợp:
//     - Chạy: Khi gọi document.save(), User.create(), new User() rồi gọi user.save(), khi password bị thay đổi và gọi save()
//     - KHÔNG chạy: Khi dùng findByIdAndUpdate(), findOneAndUpdate(), updateOne(), updateMany(), bulkWrite(), nói chung là các query udpate trực tiếp DB sẽ không chạy pre("save")
//
// ─────────────────────────────────────────────────────────────────────────────
