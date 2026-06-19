/**
 * Post Model
 * Có reference đến User (author)
 * Dùng trong bài 3 (populate)
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
    // Reference đến User model
    // Khi populate: Mongoose sẽ query User collection lấy document có _id này
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // tên Model đã đăng ký: mongoose.model("User", ...)
      required: [true, "Post must have an author"],
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    // Ví dụ embed: thay vì ref -> Comment model, ta embed stats đơn giản
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: snippet (100 ký tự đầu của content)
postSchema.virtual("snippet").get(function () {
  if (this.content && this.content.length > 100) {
    return this.content.substring(0, 100) + "...";
  }
  return this.content;
});

// Index để tìm kiếm nhanh theo author (sẽ học về indexing tuần sau)
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ published: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
