/**
 * User Model
 * Được dùng trong bài 3 (populate) và homework blog-api
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    // Cho phép virtuals xuất hiện khi convert sang JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: displayName (ví dụ về virtual field)
// Không lưu vào database — tính toán mỗi lần access
userSchema.virtual("displayName").get(function () {
  // Không dùng arrow function! Cần "this" trỏ đến document
  return `@${this.name.toLowerCase().replace(/\s+/g, "_")}`;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
