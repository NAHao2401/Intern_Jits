/**
 * Category Model
 *
 * Fields: name, slug, description
 * slug tự động tạo từ name khi save (dùng slugify)
 */

"use strict";

const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Pre-save: Auto-generate slug từ name ─────────────────────────────────────

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true, // bỏ ký tự đặc biệt
    });
  }
  next();
});

// ─── Static method ────────────────────────────────────────────────────────────

/**
 * Tìm category theo slug.
 * @param {string} slug
 * @returns {Promise<Document|null>}
 */
categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
