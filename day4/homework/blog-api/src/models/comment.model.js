/**
 * Comment Model
 *
 * Fields:
 * - content: string, bắt buộc
 * - post: ObjectId ref Post, bắt buộc
 * - author: ObjectId ref User, bắt buộc
 * - timestamps: createdAt, updatedAt
 *
 * Quan hệ:
 * - Comment belongs to Post
 * - Comment belongs to User (author)
 */

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post reference is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index để lấy comments của một post nhanh
commentSchema.index({ post: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
