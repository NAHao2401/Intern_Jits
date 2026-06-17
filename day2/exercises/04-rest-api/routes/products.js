/**
 * Products Router
 * Day 2 - Exercise 04
 *
 * Implement đầy đủ CRUD cho Products resource
 *
 * Endpoints:
 * GET    /api/products           - Lấy danh sách (có filter, sort)
 * POST   /api/products           - Tạo product mới
 * GET    /api/products/stats     - Thống kê (phải đặt TRƯỚC /:id)
 * GET    /api/products/categories - Danh sách categories
 * GET    /api/products/:id       - Lấy theo id
 * PUT    /api/products/:id       - Thay thế hoàn toàn
 * PATCH  /api/products/:id       - Cập nhật một phần
 * DELETE /api/products/:id       - Xóa
 */

const express = require("express");
const router = express.Router();
const db = require("../data/products");
const { validateBody } = require("../middleware");

// ============================================================
// Validation Schemas
// ============================================================

const createProductSchema = {
  name: { required: true, type: "string", minLength: 2, maxLength: 200 },
  price: { required: true, type: "number", min: 0 },
  category: { required: false, type: "string", maxLength: 50 },
  description: { required: false, type: "string", maxLength: 1000 },
  inStock: { required: false, type: "boolean" },
  quantity: { required: false, type: "number", min: 0 },
};

const replaceProductSchema = {
  name: { required: true, type: "string", minLength: 2, maxLength: 200 },
  price: { required: true, type: "number", min: 0 },
  category: { required: true, type: "string", maxLength: 50 },
  description: { required: false, type: "string", maxLength: 1000 },
  inStock: { required: true, type: "boolean" },
  quantity: { required: true, type: "number", min: 0 },
};

const patchProductSchema = {
  name: { required: false, type: "string", minLength: 2, maxLength: 200 },
  price: { required: false, type: "number", min: 0 },
  category: { required: false, type: "string", maxLength: 50 },
  description: { required: false, type: "string", maxLength: 1000 },
  inStock: { required: false, type: "boolean" },
  quantity: { required: false, type: "number", min: 0 },
};

// ============================================================
// GET /api/products
// ============================================================

/**
 * TODO: Implement GET / (lấy danh sách products)
 *
 * Query params được hỗ trợ:
 * - category  : lọc theo category (vd: ?category=tech)
 * - inStock   : lọc theo tồn kho (vd: ?inStock=true)
 * - minPrice  : giá tối thiểu (vd: ?minPrice=5000000)
 * - maxPrice  : giá tối đa (vd: ?maxPrice=20000000)
 * - search    : tìm kiếm trong name/description
 * - sort      : field để sort (name|price|createdAt)
 * - order     : "asc" hoặc "desc"
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": [...products],
 *   "total": <số lượng sau filter>,
 *   "filters": { <các filter đang áp dụng> }
 * }
 */
router.get("/", (req, res) => {
  // TODO: lấy query params và gọi db.getAll(options)
  // Hint: const { category, inStock, minPrice, maxPrice, search, sort, order } = req.query;
  const { category, inStock, minPrice, maxPrice, search, sort, order } =
    req.query;

  const options = {
    category,
    inStock,
    minPrice,
    maxPrice,
    search,
    sort,
    order,
  };

  const products = db.getAll(options);

  res.json({
    success: true,
    data: products,
    total: products.length,
    filters: options,
  });
});

// ============================================================
// GET /api/products/stats
// ============================================================

/**
 * TODO: Implement GET /stats (thống kê)
 *
 * QUAN TRỌNG: Route này phải đặt TRƯỚC route /:id
 * Vì nếu đặt sau, Express sẽ hiểu "stats" là id
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "total": 5,
 *     "inStock": 4,
 *     "outOfStock": 1,
 *     "totalValue": 123000000,
 *     "byCategory": { "tech": 3, "furniture": 2 }
 *   }
 * }
 */
router.get("/stats", (req, res) => {
  // TODO: gọi db.getStats()
  const stats = db.getStats();

  res.json({
    success: true,
    data: stats,
  });
});

// ============================================================
// GET /api/products/categories
// ============================================================

/**
 * TODO: Implement GET /categories (danh sách categories)
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": ["tech", "furniture", ...]
 * }
 */
router.get("/categories", (req, res) => {
  // TODO: gọi db.getCategories()
  const categories = db.getCategories();

  res.json({
    success: true,
    data: categories,
  });
});

// ============================================================
// GET /api/products/:id
// ============================================================

/**
 * TODO: Implement GET /:id (lấy product theo id)
 *
 * Response 200: { "success": true, "data": <product> }
 * Response 400: { "success": false, "error": "Invalid product ID" }  <- nếu id không phải số
 * Response 404: { "success": false, "error": "Product not found" }
 */
router.get("/:id", (req, res) => {
  // TODO:
  // 1. Validate req.params.id là số (dùng isNaN hoặc Number.isInteger)
  // 2. Gọi db.getById(id)
  // 3. Trả về 404 nếu không tìm thấy
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    });
  }

  const product = db.getById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

// ============================================================
// POST /api/products
// ============================================================

/**
 * TODO: Implement POST / (tạo product mới)
 *
 * Validate middleware đã handle các lỗi validation cơ bản.
 * Trong handler này, check thêm business rules:
 * - Nếu inStock: false mà quantity > 0 -> 400 (không hợp lý)
 * - Nếu inStock: true mà quantity = 0 -> tự động set inStock = false
 *
 * Response 201: { "success": true, "data": <product mới>, "message": "Product created successfully" }
 */
router.post("/", validateBody(createProductSchema), (req, res) => {
  // TODO:
  // 1. Check business rules
  // 2. Gọi db.create(req.body)
  // 3. Trả về 201
  const data = { ...req.body };

  if (data.inStock === false && data.quantity > 0) {
    return res.status(400).json({
      success: false,
      error: "Product cannot have quantity greater than 0 when out of stock",
    });
  }

  if (data.inStock === true && data.quantity === 0) {
    data.inStock = false;
  }

  const product = db.create(data);

  res.status(201).json({
    success: true,
    data: product,
    message: "Product created successfully",
  });
});

// ============================================================
// PUT /api/products/:id
// ============================================================

/**
 * TODO: Implement PUT /:id (thay thế hoàn toàn product)
 *
 * PUT khác PATCH: PUT yêu cầu TẤT CẢ fields bắt buộc
 * Các field không có trong body sẽ bị reset về default/null
 *
 * Response 200: { "success": true, "data": <product sau update> }
 * Response 404: { "success": false, "error": "Product not found" }
 */
router.put("/:id", validateBody(replaceProductSchema), (req, res) => {
  // TODO:
  // 1. Validate id
  // 2. Gọi db.replace(id, req.body) - thay thế hoàn toàn
  // 3. 404 nếu không tìm thấy
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    });
  }

  const data = { ...req.body };

  if (data.inStock === false && data.quantity > 0) {
    return res.status(400).json({
      success: false,
      error: "Product cannot have quantity greater than 0 when out of stock",
    });
  }

  if (data.inStock === true && data.quantity === 0) {
    data.inStock = false;
  }

  const updatedProduct = db.replace(id, data);

  if (!updatedProduct) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.json({
    success: true,
    data: updatedProduct,
  });
});

// ============================================================
// PATCH /api/products/:id
// ============================================================

/**
 * TODO: Implement PATCH /:id (cập nhật một phần product)
 *
 * PATCH chỉ update các field có trong body, giữ nguyên các field khác
 * Nếu body rỗng -> 400 { error: "At least one field required for update" }
 *
 * Response 200: { "success": true, "data": <product sau update> }
 * Response 400: nếu body rỗng
 * Response 404: nếu không tìm thấy
 */
router.patch("/:id", validateBody(patchProductSchema), (req, res) => {
  // TODO:
  // 1. Validate id
  // 2. Check body không rỗng: Object.keys(req.body).length === 0
  // 3. Gọi db.update(id, req.body) - chỉ update fields có trong body
  // 4. 404 nếu không tìm thấy
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    });
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field required for update",
    });
  }

  const currentProduct = db.getById(id);

  if (!currentProduct) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  const mergedData = {
    ...currentProduct,
    ...req.body,
  };

  if (mergedData.inStock === false && mergedData.quantity > 0) {
    return res.status(400).json({
      success: false,
      error: "Product cannot have quantity greater than 0 when out of stock",
    });
  }

  if (mergedData.inStock === true && mergedData.quantity === 0) {
    req.body.inStock = false;
  }

  const updatedProduct = db.update(id, req.body);

  res.json({
    success: true,
    data: updatedProduct,
  });
});

// ============================================================
// DELETE /api/products/:id
// ============================================================

/**
 * TODO: Implement DELETE /:id (xóa product)
 *
 * Response 200: { "success": true, "message": "Product deleted successfully" }
 * Hoặc 204 (không có body) - cả hai đều chấp nhận được
 * Response 404: { "success": false, "error": "Product not found" }
 */
router.delete("/:id", (req, res) => {
  // TODO:
  // 1. Validate id
  // 2. Gọi db.remove(id)
  // 3. 404 nếu không tìm thấy
  // 4. 200 với message nếu xóa thành công
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    });
  }

  const deleted = db.remove(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = router;
