/**
 * Post Model
 *
 * Fields:
 * - title: string, bắt buộc
 * - content: string, bắt buộc
 * - author: ObjectId ref User, bắt buộc
 * - tags: array of strings, default []
 * - published: boolean, default false
 * - timestamps: createdAt, updatedAt
 *
 * Quan hệ: Post belongs to User (author)
 */

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // tên Model: mongoose.model("User", ...)
      required: [true, "Author is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để query nhanh
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ published: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
