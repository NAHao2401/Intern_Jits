/**
 * Products REST API - Entry Point
 * Day 2 - Exercise 04
 *
 * Chạy: node index.js
 * Dev:  nodemon index.js
 *
 * Endpoints:
 * GET    /                         - API info
 * GET    /api/products             - Danh sách products
 * POST   /api/products             - Tạo product mới
 * GET    /api/products/stats       - Thống kê
 * GET    /api/products/categories  - Danh sách categories
 * GET    /api/products/:id         - Lấy product theo id
 * PUT    /api/products/:id         - Thay thế product
 * PATCH  /api/products/:id         - Cập nhật một phần
 * DELETE /api/products/:id         - Xóa product
 */

const express = require("express");
const app = express();
const productsRouter = require("./routes/products");
const { requestLogger, notFoundHandler, errorHandler } = require("./middleware");

const PORT = process.env.PORT || 3004;

// ============================================================
// Global Middleware
// ============================================================

// Parse JSON body
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use(requestLogger);

// ============================================================
// Routes
// ============================================================

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Products API v1.0",
    version: "1.0.0",
    endpoints: {
      "GET /api/products": "Lấy danh sách products (có filter, sort)",
      "POST /api/products": "Tạo product mới",
      "GET /api/products/stats": "Thống kê",
      "GET /api/products/categories": "Danh sách categories",
      "GET /api/products/:id": "Lấy product theo id",
      "PUT /api/products/:id": "Thay thế product (full update)",
      "PATCH /api/products/:id": "Cập nhật một phần product",
      "DELETE /api/products/:id": "Xóa product",
    },
    queryParams: {
      filter: ["category", "inStock", "minPrice", "maxPrice", "search"],
      sort: ["sort=name|price|createdAt", "order=asc|desc"],
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Products router
app.use("/api/products", productsRouter);

// ============================================================
// Error Handling - PHẢI đặt sau tất cả routes
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

const server = app.listen(PORT, () => {
  console.log(`\nProducts API running on http://localhost:${PORT}`);
  console.log(`API Info: http://localhost:${PORT}/`);
  console.log("\n--- Test với curl ---");
  console.log(`\n# Lấy tất cả products:`);
  console.log(`curl http://localhost:${PORT}/api/products`);
  console.log(`\n# Filter và sort:`);
  console.log(`curl "http://localhost:${PORT}/api/products?category=tech&sort=price&order=desc"`);
  console.log(`curl "http://localhost:${PORT}/api/products?inStock=true&minPrice=10000000"`);
  console.log(`curl "http://localhost:${PORT}/api/products?search=laptop"`);
  console.log(`\n# Lấy product theo id:`);
  console.log(`curl http://localhost:${PORT}/api/products/1`);
  console.log(`\n# Thống kê:`);
  console.log(`curl http://localhost:${PORT}/api/products/stats`);
  console.log(`\n# Categories:`);
  console.log(`curl http://localhost:${PORT}/api/products/categories`);
  console.log(`\n# Tạo product mới:`);
  console.log(`curl -X POST http://localhost:${PORT}/api/products \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"name":"Keyboard","price":2000000,"category":"tech","inStock":true,"quantity":15}'`);
  console.log(`\n# Cập nhật một phần:`);
  console.log(`curl -X PATCH http://localhost:${PORT}/api/products/1 \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"price":32000000,"inStock":false}'`);
  console.log(`\n# Thay thế hoàn toàn:`);
  console.log(`curl -X PUT http://localhost:${PORT}/api/products/2 \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"name":"iPhone 16 Pro","price":30000000,"category":"tech","inStock":true,"quantity":20}'`);
  console.log(`\n# Xóa product:`);
  console.log(`curl -X DELETE http://localhost:${PORT}/api/products/3`);
  console.log(`\n# Test 404:`);
  console.log(`curl http://localhost:${PORT}/api/products/999`);
  console.log(`\n# Test validation error:`);
  console.log(`curl -X POST http://localhost:${PORT}/api/products -H "Content-Type: application/json" -d '{"price":-100}'`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\nShutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

module.exports = app;
