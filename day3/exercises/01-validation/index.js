/**
 * Bài tập 1 - Input Validation với Joi
 * Day 3 - Validation, Authentication & Project Structure
 *
 * Mục tiêu:
 * - Định nghĩa Joi schema cho các loại dữ liệu khác nhau
 * - Tạo validate middleware tái sử dụng
 * - Validate cả req.body lẫn req.query
 * - Trả về lỗi rõ ràng, đúng field
 *
 * Cài đặt: npm install express joi
 * Chạy: node index.js
 * Test: curl http://localhost:3001/...
 */

const express = require("express");
const Joi = require("joi");
const app = express();
const PORT = 3001;

app.use(express.json());

// ============================================================
// Validate middleware (tái sử dụng cho mọi route)
// ============================================================

/**
 * TODO 0: Implement validate middleware factory
 *
 * validate(schema, source = "body") nhận schema Joi và source ("body" | "query")
 * - Validate req[source] với schema
 * - Options: abortEarly: false, stripUnknown: true
 * - Nếu lỗi -> 400 { success: false, error: "Validation failed", details: [{field, message}] }
 * - Nếu OK -> req[source] = sanitized value, gọi next()
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    // TODO: implement
    // Hint: schema.validate(req[source], { abortEarly: false, stripUnknown: true })
    // Hint: error.details.map(d => ({ field: d.path.join("."), message: d.message }))
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", details });
    }
    req[source] = value;
    next();
  };
}

// ============================================================
// 1.1: Schema cơ bản - Products
// ============================================================

/**
 * TODO 1.1: Định nghĩa productSchema với Joi:
 * - name     : string, 2-100 ký tự, bắt buộc
 * - price    : number, > 0, bắt buộc
 * - category : "tech" | "furniture" | "clothing", bắt buộc
 * - inStock  : boolean, mặc định true
 * - description: string, max 500 ký tự, không bắt buộc
 */
const productSchema = Joi.object({
  // TODO: define schema
  name: Joi.string().min(2).max(100).required(),

  price: Joi.number().greater(0).required(),

  category: Joi.string().valid("tech", "furniture", "clothing").required(),

  inStock: Joi.boolean().default(true),

  description: Joi.string().max(500).optional(),
});

/**
 * TODO 1.1: Implement POST /api/products
 * - Dùng validate(productSchema) middleware
 * - Nếu qua validation: 201 { success: true, data: req.body }
 *
 * Test các case:
 * curl -X POST http://localhost:3001/api/products \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Laptop","price":25000000,"category":"tech"}'
 *
 * curl -X POST http://localhost:3001/api/products \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"A","price":-1,"category":"wrong"}'
 *
 * curl -X POST http://localhost:3001/api/products \
 *   -H "Content-Type: application/json" \
 *   -d '{}'
 */
app.post("/api/products", validate(productSchema), (req, res) => {
  // TODO: implement - trả về 201 với data đã được sanitize
  res.status(201).json({ success: true, data: req.body });
});

// ============================================================
// 1.2: Validate query params
// ============================================================

/**
 * TODO 1.2: Định nghĩa productQuerySchema để validate req.query:
 * - page  : integer, min 1, default 1
 * - limit : integer, min 1, max 100, default 10
 * - sort  : "price_asc" | "price_desc" | "name_asc", không bắt buộc
 *
 * Gợi ý: Joi.number().integer() tự convert string "1" -> 1
 * Thêm option convert: true khi validate (mặc định của Joi)
 */
const productQuerySchema = Joi.object({
  // TODO: define schema
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("price_asc", "price_desc", "name_asc").optional(),
});

// In-memory products để demo
const products = [
  { id: 1, name: "Laptop", price: 25000000, category: "tech", inStock: true },
  { id: 2, name: "Phone", price: 15000000, category: "tech", inStock: false },
  { id: 3, name: "Desk", price: 5000000, category: "furniture", inStock: true },
  {
    id: 4,
    name: "Chair",
    price: 3000000,
    category: "furniture",
    inStock: true,
  },
  { id: 5, name: "Monitor", price: 8000000, category: "tech", inStock: true },
];

/**
 * TODO 1.2: Implement GET /api/products với validate query
 * - Validate req.query bằng validate(productQuerySchema, "query")
 * - Áp dụng pagination: trả về products theo page và limit
 * - Áp dụng sort nếu có
 * - Response:
 *   {
 *     success: true,
 *     data: [...],
 *     pagination: { page, limit, total, totalPages }
 *   }
 *
 * Test:
 * curl "http://localhost:3001/api/products?page=1&limit=3"
 * curl "http://localhost:3001/api/products?sort=price_asc"
 * curl "http://localhost:3001/api/products?page=0"         <- lỗi validation
 * curl "http://localhost:3001/api/products?limit=200"      <- lỗi validation
 */
app.get("/api/products", validate(productQuerySchema, "query"), (req, res) => {
  // TODO: implement pagination và sort
  // Hint: sau khi validate, req.query đã có giá trị default
  // const { page, limit, sort } = req.query;
  const { page, limit, sort } = req.query;

  let result = [...products];

  if (sort === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  }
  if (sort === "price_desc") {
    result.sort((a, b) => b.price - a.price);
  }
  if (sort === "name_asc") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = result.length;
  const totalPages = Math.ceil(total / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedResult = result.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedResult,
    pagination: { page, limit, total, totalPages },
  });
});

// ============================================================
// 1.3: Nested validation - Orders
// ============================================================

/**
 * TODO 1.3: Định nghĩa orderSchema với nested object và array:
 *
 * - customerId    : number, integer, bắt buộc
 * - items         : array, tối thiểu 1 phần tử, bắt buộc
 *   - productId   : number, integer, bắt buộc
 *   - quantity    : integer, min 1, max 99, bắt buộc
 * - shippingAddress: object, bắt buộc
 *   - street      : string, bắt buộc
 *   - city        : string, bắt buộc
 *   - district    : string, không bắt buộc
 * - note          : string, max 200 ký tự, không bắt buộc
 *
 * Gợi ý:
 * Joi.array().items(Joi.object({...})).min(1).required()
 */
const orderSchema = Joi.object({
  // TODO: define schema
  customerId: Joi.number().integer().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).max(99).required(),
      }),
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    district: Joi.string().optional(),
  }).required(),
  note: Joi.string().max(200).optional(),
});

/**
 * TODO 1.3: Implement POST /api/orders
 * - Validate với orderSchema
 * - Nếu OK: tính totalItems (tổng quantity của tất cả items)
 * - Response 201:
 *   {
 *     success: true,
 *     data: {
 *       orderId: <random number>,
 *       ...req.body,
 *       totalItems: <tổng quantity>,
 *       createdAt: new Date()
 *     }
 *   }
 *
 * Test:
 * curl -X POST http://localhost:3001/api/orders \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "customerId": 1,
 *     "items": [
 *       {"productId": 1, "quantity": 2},
 *       {"productId": 3, "quantity": 1}
 *     ],
 *     "shippingAddress": {"street": "123 Nguyen Hue", "city": "HCM"}
 *   }'
 *
 * Test lỗi - items rỗng:
 * curl -X POST http://localhost:3001/api/orders \
 *   -H "Content-Type: application/json" \
 *   -d '{"customerId":1,"items":[],"shippingAddress":{"street":"abc","city":"HCM"}}'
 *
 * Test lỗi - quantity = 0:
 * curl -X POST http://localhost:3001/api/orders \
 *   -H "Content-Type: application/json" \
 *   -d '{"customerId":1,"items":[{"productId":1,"quantity":0}],"shippingAddress":{"street":"abc","city":"HCM"}}'
 *
 * Test lỗi - thiếu shippingAddress:
 * curl -X POST http://localhost:3001/api/orders \
 *   -H "Content-Type: application/json" \
 *   -d '{"customerId":1,"items":[{"productId":1,"quantity":2}]}'
 */
app.post("/api/orders", validate(orderSchema), (req, res) => {
  // TODO: implement
  // Hint: const totalItems = req.body.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalItems = req.body.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const order = {
    orderId: Math.floor(Math.random() * 1000000),
    ...req.body,
    totalItems,
    createdAt: new Date(),
  };
  res.status(201).json({ success: true, data: order });
});

// ============================================================
// 1.4: BONUS - Custom Joi validation
// ============================================================

/**
 * TODO 1.4 (bonus): Định nghĩa userRegistrationSchema với custom validation:
 *
 * - username    : string, 3-20 ký tự, chỉ chứa chữ cái và số và _, bắt buộc
 * - email       : email hợp lệ, bắt buộc
 * - password    : string, min 8 ký tự, phải có ít nhất 1 chữ hoa + 1 số, bắt buộc
 * - confirmPassword: phải trùng với password (dùng Joi.ref("password"))
 * - age         : integer, min 13, max 120, không bắt buộc
 *
 * Gợi ý confirmPassword:
 * confirmPassword: Joi.string().valid(Joi.ref("password")).required()
 *   .messages({ "any.only": "Passwords do not match" })
 */
const userRegistrationSchema = Joi.object({
  // TODO: define schema
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(20)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  age: Joi.number().integer().min(13).max(120).optional(),
});

/**
 * TODO 1.4 (bonus): POST /api/register
 * - Validate với userRegistrationSchema
 * - Không trả về confirmPassword trong response
 * - Response 201: { success: true, data: { username, email, age } }
 *
 * Test:
 * curl -X POST http://localhost:3001/api/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"alice123","email":"alice@example.com","password":"Secret123","confirmPassword":"Secret123"}'
 *
 * Test lỗi - password không khớp:
 * curl -X POST http://localhost:3001/api/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"alice123","email":"alice@example.com","password":"Secret123","confirmPassword":"wrong"}'
 */
app.post("/api/register", validate(userRegistrationSchema), (req, res) => {
  // TODO: implement
  const { username, email, age } = req.body;
  res.status(201).json({ success: true, data: { username, email, age } });
});

// ============================================================
// 404 & Error Handler
// ============================================================

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, error: `Cannot ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// ============================================================
// Start server
// ============================================================

app.listen(PORT, () => {
  console.log(
    `\nValidation Exercise server running on http://localhost:${PORT}`,
  );
  console.log("\n--- Test commands ---");
  console.log("\n# 1.1: Tạo product hợp lệ:");
  console.log(`curl -X POST http://localhost:${PORT}/api/products \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(
    `  -d '{"name":"Laptop","price":25000000,"category":"tech","inStock":true}'`,
  );
  console.log("\n# 1.1: Thiếu field bắt buộc:");
  console.log(`curl -X POST http://localhost:${PORT}/api/products \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"name":"A","price":-100,"category":"wrong"}'`);
  console.log("\n# 1.2: List products với pagination:");
  console.log(
    `curl "http://localhost:${PORT}/api/products?page=1&limit=3&sort=price_asc"`,
  );
  console.log("\n# 1.2: Validation lỗi query:");
  console.log(`curl "http://localhost:${PORT}/api/products?page=0&limit=999"`);
  console.log("\n# 1.3: Tạo order:");
  console.log(`curl -X POST http://localhost:${PORT}/api/orders \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(
    `  -d '{"customerId":1,"items":[{"productId":1,"quantity":2}],"shippingAddress":{"street":"123 Nguyen Hue","city":"HCM"}}'`,
  );
});
