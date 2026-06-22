/**
 * Categories Service
 *
 * Business logic cho category CRUD.
 * Pattern: throw error với .statusCode, controller gọi next(err)
 */

"use strict";

const Category = require("../models/Category");
const Product = require("../models/Product");

// ─── Get All Categories ───────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả categories.
 *
 * TODO CAT-1: Implement getAll
 *   1. Category.find().sort({ name: 1 })
 *   2. Return array of categories
 *
 * @returns {Promise<Document[]>}
 */
async function getAll() {
  // TODO CAT-1
  return await Category.find().toSorted({ name: 1 });
}

// ─── Get Category by ID ───────────────────────────────────────────────────────

/**
 * Lấy category theo ID.
 *
 * TODO CAT-2: Implement getById
 *   1. Category.findById(id)
 *   2. Nếu không tìm thấy: throw error statusCode 404 "Category not found"
 *   3. Return category
 *
 * @param {string} id
 * @returns {Promise<Document>}
 */
async function getById(id) {
  // TODO CAT-2
  const category = await Category.findById(id);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  return category;
}

// ─── Create Category ──────────────────────────────────────────────────────────

/**
 * Tạo category mới (admin only).
 * slug tự động tạo từ name qua pre("save") hook trong model.
 *
 * TODO CAT-3: Implement create
 *   1. Category.create({ name, description })
 *      pre("save") hook tự tạo slug
 *   2. Return category
 *
 * Note: Nếu tên đã tồn tại, MongoDB throw duplicate key error (11000)
 *   errorHandler middleware sẽ tự xử lý -> trả về 409
 *
 * @param {{ name: string, description?: string }} data
 * @returns {Promise<Document>}
 */
async function create(data) {
  // TODO CAT-3
  return await Category.create(data);
}

// ─── Update Category ──────────────────────────────────────────────────────────

/**
 * Cập nhật category (admin only).
 *
 * TODO CAT-4: Implement update
 *   1. Category.findById(id)
 *      Nếu không tìm thấy: throw 404
 *   2. Nếu data.name thay đổi: pre("save") hook tự update slug
 *   3. Object.assign(category, data)
 *   4. category.save()
 *   5. Return updated category
 *
 * @param {string} id
 * @param {{ name?, description? }} data
 * @returns {Promise<Document>}
 */
async function update(id, data) {
  // TODO CAT-4
  const category = await Category.findById(id);

  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  Object.assign(category, data);

  await category.save();
  return category;
}

// ─── Delete Category ──────────────────────────────────────────────────────────

/**
 * Xóa category (admin only).
 *
 * TODO CAT-5: Implement deleteCategory
 *   1. Kiểm tra có product nào dùng category này không:
 *      const count = await Product.countDocuments({ category: id });
 *      Nếu count > 0: throw error statusCode 409
 *        "Cannot delete category with existing products (${count} products)"
 *   2. Category.findByIdAndDelete(id)
 *      Nếu null: throw 404
 *   3. Return { message: "Category deleted" }
 *
 * Tại sao cần check products trước?
 *   -> Nếu xóa category đang được dùng, products sẽ có dangling reference
 *
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
async function deleteCategory(id) {
  // TODO CAT-5
  const count = await Product.countDocuments({ category: id });

  if (count > 0) {
    const err = new Error(
      `Cannot delete category with existing products (${count} products)`,
    );
    err.statusCode(409);
    throw err;
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    message: "Category deleted",
  };
}

// ─── Get Products by Category ─────────────────────────────────────────────────

/**
 * Lấy products thuộc category, có pagination.
 *
 * TODO CAT-6: Implement getProductsByCategory
 *   1. Kiểm tra category tồn tại (getById)
 *   2. Dùng Product.findByCategory(id, options) — static method đã có trong model
 *   3. Return { category, ...paginatedProducts }
 *
 * Hint:
 *   const category = await getById(id);
 *   const result = await Product.findByCategory(id, options);
 *   return { category, ...result };
 *
 * @param {string} id - category id
 * @param {{ page, limit }} options
 * @returns {Promise<{ category, data, pagination }>}
 */
async function getProductsByCategory(id, options = {}) {
  // TODO CAT-6
  const category = await Category.findById(id);

  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }

  const result = await Product.findByCategory(id, options);

  return {
    category,
    ...result,
  };
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteCategory,
  getProductsByCategory,
};
