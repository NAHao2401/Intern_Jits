/**
 * User Model
 *
 * Fields:
 *   firstName, lastName, email, password, role, addresses, timestamps
 *
 * Features:
 *   - pre("save") hook: auto-hash password
 *   - Instance method: comparePassword(plaintext)
 *   - Static method: findByEmail(email)
 *   - Virtual: fullName
 *   - Virtual: defaultAddress (địa chỉ có isDefault: true)
 */

"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ─── Address Sub-Schema ───────────────────────────────────────────────────────

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

// ─── User Schema ──────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
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
      // select: false — password không bị trả về trong query mặc định
      // Uncomment sau khi hiểu tác dụng:
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["customer", "admin"],
        message: '"{VALUE}" is not a valid role',
      },
      default: "customer",
    },
    addresses: [addressSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// email đã có unique: true -> MongoDB tự tạo unique index
// Thêm index cho role nếu hay query theo role
userSchema.index({ role: 1 });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
//
// Auto-hash password trước khi lưu vào DB.
// Chỉ hash khi password field bị thay đổi.
//
// Lưu ý: Hook này KHÔNG chạy khi dùng findByIdAndUpdate() hoặc updateOne()
// Để update password, phải: fetch user -> gán password mới -> .save()

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * So sánh plaintext password với hashed password trong DB.
 * @param {string} plaintext
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.password);
};

/**
 * Trả về object an toàn để trả về client (không có password).
 * @returns {object}
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ─── Static Methods ───────────────────────────────────────────────────────────

/**
 * Tìm user theo email (case-insensitive).
 * @param {string} email
 * @returns {Promise<Document|null>}
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// ─── Virtuals ─────────────────────────────────────────────────────────────────

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("defaultAddress").get(function () {
  if (!this.addresses || this.addresses.length === 0) return null;
  return this.addresses.find((a) => a.isDefault) || this.addresses[0];
});

// ─── Model ────────────────────────────────────────────────────────────────────

const User = mongoose.model("User", userSchema);

module.exports = User;
