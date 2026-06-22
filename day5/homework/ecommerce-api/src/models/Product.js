/**
 * Product Model
 *
 * Fields:
 *   name, description, price, category (ref), stock, images, ratings, timestamps
 *
 * Design decisions:
 *   - ratings: embedded array (embed vì ratings thuộc về product, query cùng product)
 *   - category: ref (Category là independent entity, nhiều products dùng chung)
 *   - avgRating: virtual (tính toán từ ratings array, không cần lưu DB)
 */

"use strict";

const mongoose = require("mongoose");

// ─── Rating Sub-Schema ────────────────────────────────────────────────────────

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [1, "Score must be at least 1"],
      max: [5, "Score cannot exceed 5"],
    },
    review: {
      type: String,
      trim: true,
      maxlength: [500, "Review cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// ─── Product Schema ───────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 images allowed",
      },
    },
    ratings: [ratingSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: "text", description: "text" }); // text search

// ─── Virtuals ─────────────────────────────────────────────────────────────────

productSchema.virtual("avgRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10; // round to 1 decimal
});

productSchema.virtual("ratingCount").get(function () {
  return this.ratings ? this.ratings.length : 0;
});

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ─── Pre-find: Chỉ trả về active products ────────────────────────────────────

productSchema.pre(/^find/, function (next) {
  // "this" = query object
  // Chỉ filter nếu isActive chưa được explicitly set trong query
  if (this.getFilter().isActive === undefined) {
    this.where({ isActive: true });
  }
  next();
});

// ─── Static Methods ───────────────────────────────────────────────────────────

/**
 * Tìm products theo category.
 * @param {string} categoryId
 * @param {object} options - { page, limit }
 * @returns {Promise<{ data, pagination }>}
 */
productSchema.statics.findByCategory = async function (categoryId, options = {}) {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.find({ category: categoryId })
      .populate("category", "name slug")
      .skip(skip)
      .limit(limit),
    this.countDocuments({ category: categoryId }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
