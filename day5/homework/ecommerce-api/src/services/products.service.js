/**
 * Products Service
 *
 * Business logic cho product CRUD, rating, và aggregation stats.
 * Pattern: throw error với .statusCode, controller gọi next(err)
 */

"use strict";

const Product = require("../models/Product");
const Category = require("../models/Category");

// ─── Get Products (list với filter + pagination) ──────────────────────────────

/**
 * Lấy danh sách products với filter và pagination.
 *
 * TODO PROD-1: Implement getProducts
 *   1. Build query object từ filters:
 *      - category: filter theo category ObjectId
 *      - minPrice / maxPrice: dùng $gte / $lte
 *      - search: dùng $text search hoặc $regex trên name
 *   2. Dùng Promise.all để chạy song song:
 *      - Product.find(query).populate("category","name slug").skip(skip).limit(limit)
 *      - Product.countDocuments(query)
 *   3. Return { data, pagination: { total, page, limit, totalPages } }
 *
 * Hint:
 *   const query = {};
 *   if (filters.category) query.category = filters.category;
 *   if (filters.minPrice || filters.maxPrice) {
 *     query.price = {};
 *     if (filters.minPrice) query.price.$gte = filters.minPrice;
 *     if (filters.maxPrice) query.price.$lte = filters.maxPrice;
 *   }
 *   if (filters.search) query.name = { $regex: filters.search, $options: "i" };
 *   const [data, total] = await Promise.all([...]);
 *
 * @param {object} filters - { category, minPrice, maxPrice, search }
 * @param {object} options - { page, limit, sort }
 * @returns {Promise<{ data, pagination }>}
 */
async function getProducts(filters = {}, options = {}) {
  // TODO PROD-1
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};

    if (filters.minPrice) {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  if (filters.search) {
    query.name = {
      $regex: filters.search,
      $options: "i",
    };
  }

  const [data, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .skip(skip)
      .limit(limit),

    Product.countDocuments(query),
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
}

// ─── Get Product by ID ────────────────────────────────────────────────────────

/**
 * Lấy product theo ID kèm category info.
 *
 * TODO PROD-2: Implement getById
 *   1. Product.findById(id).populate("category", "name slug description")
 *   2. Nếu không tìm thấy: throw error statusCode 404 "Product not found"
 *   3. Return product
 *
 * Hint:
 *   const product = await Product.findById(id).populate("category", "name slug description");
 *   if (!product) { ... }
 *
 * @param {string} id
 * @returns {Promise<Document>}
 */
async function getById(id) {
  // TODO PROD-2
  const product = await Product.findById(id).populate(
    "category",
    "name slug description",
  );

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  return product;
}

// ─── Create Product ───────────────────────────────────────────────────────────

/**
 * Tạo product mới (admin only).
 *
 * TODO PROD-3: Implement create
 *   1. Kiểm tra category tồn tại: Category.findById(data.category)
 *      Nếu không tìm thấy: throw error statusCode 400 "Category not found"
 *   2. Tạo product: Product.create(data)
 *   3. Populate category rồi return
 *
 * Hint:
 *   const category = await Category.findById(data.category);
 *   if (!category) { ... }
 *   const product = await Product.create(data);
 *   return product.populate("category", "name slug");
 *
 * @param {object} data
 * @returns {Promise<Document>}
 */
async function create(data) {
  // TODO PROD-3
  const category = await Category.findById(data.category);

  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 400;
    throw err;
  }

  const product = await Product.create(data);

  await product.populate("category", "name slug");

  return product;
}

// ─── Update Product ───────────────────────────────────────────────────────────

/**
 * Cập nhật product (admin only).
 *
 * TODO PROD-4: Implement update
 *   1. Tìm product: Product.findById(id)
 *      Nếu không tìm thấy: throw 404
 *   2. Nếu data.category thay đổi: kiểm tra category mới tồn tại
 *   3. Object.assign(product, data) — gán fields cần update
 *   4. product.save() — để Mongoose validation và hooks chạy
 *   5. Populate và return
 *
 * Lưu ý: Dùng findById + save thay vì findByIdAndUpdate
 *   để Mongoose validation (schema validators) chạy đúng
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<Document>}
 */
async function update(id, data) {
  // TODO PROD-4
  const product = await Product.findById(id);

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  if (data.category) {
    const category = await Category.findById(data.category);

    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 400;
      throw err;
    }
  }

  Object.assign(product, data);

  await product.save();

  await product.populate("category", "name slug");

  return product;
}

// ─── Delete Product (soft delete) ────────────────────────────────────────────

/**
 * Soft-delete product (set isActive: false).
 *
 * TODO PROD-5: Implement softDelete
 *   1. Tìm product: Product.findById(id)
 *      Nếu không tìm thấy: throw 404
 *   2. Set product.isActive = false
 *   3. product.save()
 *   4. Return { message: "Product deleted" }
 *
 * Lưu ý: pre(/^find/) hook đã filter isActive: true
 *   -> Sau khi soft delete, product không xuất hiện trong list nữa
 *
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
async function softDelete(id) {
  // TODO PROD-5
  const product = await Product.findById(id);

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  product.isActive = false;

  await product.save();

  return {
    message: "Product deleted",
  };
}

// ─── Add Rating ───────────────────────────────────────────────────────────────

/**
 * Thêm hoặc update rating của user cho product.
 *
 * TODO PROD-6: Implement addRating
 *   1. Tìm product (phải dùng { isActive: undefined } để bypass pre-find hook):
 *      Product.findById(id) — nhưng cần bypass pre(/^find/) filter
 *      Gợi ý: dùng Product.findOne({ _id: id }) — vẫn bị filter
 *      Cách đúng: gọi trực tiếp với điều kiện isActive: true
 *   2. Kiểm tra user đã rating chưa:
 *      const existingIndex = product.ratings.findIndex(
 *        r => r.user.toString() === userId
 *      );
 *   3. Nếu đã rating: update existing rating
 *      product.ratings[existingIndex].score = score;
 *      product.ratings[existingIndex].review = review;
 *   4. Nếu chưa: push rating mới
 *      product.ratings.push({ user: userId, score, review });
 *   5. product.save()
 *   6. Return product với avgRating, ratingCount
 *
 * @param {string} id - product id
 * @param {string} userId - user id từ JWT
 * @param {{ score: number, review?: string }} ratingData
 * @returns {Promise<Document>}
 */
async function addRating(id, userId, ratingData) {
  // TODO PROD-6
  const { score, review } = ratingData;

  const product = await Product.findOne({
    _id: id,
    isActive: true,
  });

  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const existingIndex = product.ratings.findIndex(
    (r) => r.user.toString() === userId,
  );

  if (existingIndex !== -1) {
    product.ratings[existingIndex].score = score;
    product.ratings[existingIndex].review = review;
  } else {
    product.ratings.push({
      user: userId,
      score,
      review,
    });
  }

  await product.save();

  return product;
}

// ─── Get Stats (Aggregation) ──────────────────────────────────────────────────

/**
 * Thống kê product theo aggregation pipeline.
 *
 * TODO PROD-7: Implement getStats dùng aggregation pipeline
 *   Trả về thống kê cho 1 product:
 *   {
 *     productId,
 *     name,
 *     totalRatings: số lượng ratings,
 *     avgRating: điểm trung bình (rounded 1 decimal),
 *     ratingDistribution: { "1": n, "2": n, "3": n, "4": n, "5": n },
 *   }
 *
 * Pipeline gợi ý:
 *   [
 *     { $match: { _id: mongoose.Types.ObjectId(id) } },
 *     { $unwind: { path: "$ratings", preserveNullAndEmptyArrays: true } },
 *     {
 *       $group: {
 *         _id: "$_id",
 *         name: { $first: "$name" },
 *         avgRating: { $avg: "$ratings.score" },
 *         totalRatings: { $sum: { $cond: [{ $ifNull: ["$ratings", false] }, 1, 0] } },
 *         // ratingDistribution cần thêm stage $group hoặc $project sau
 *       }
 *     },
 *   ]
 *
 * Bonus: Dùng $facet để tính totalRatings và ratingDistribution trong 1 pipeline.
 *
 * @param {string} id - product id
 * @returns {Promise<object>}
 */
async function getStats(id) {
  // TODO PROD-7
  const result = await Product.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },

    {
      $unwind: {
        path: "$ratings",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: "$_id",
        name: {
          $first: "$name",
        },
        avgRating: {
          $avg: "$ratings.score",
        },
        totalRatings: {
          $sum: {
            $cond: [
              {
                $ifNull: ["$ratings", false],
              },
              1,
              0,
            ],
          },
        },

        ratings: {
          $push: "$ratings.score",
        },
      },
    },
  ]);

  if (!result.length) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const stats = result[0];

  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  stats.ratings.forEach((score) => {
    if (score) distribution[score]++;
  });

  return {
    productId: stats._id,
    name: stats.name,
    totalRatings: stats.totalRatings,
    avgRating: Number((stats.avgRating || 0).toFixed(1)),
    ratingDistribution: distribution,
  };
}

module.exports = {
  getProducts,
  getById,
  create,
  update,
  softDelete,
  addRating,
  getStats,
};
