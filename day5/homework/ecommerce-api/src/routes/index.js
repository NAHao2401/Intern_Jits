/**
 * Router index — mount tất cả route groups
 */

"use strict";

const router = require("express").Router();

const authRoutes = require("./auth.routes");
const productsRoutes = require("./products.routes");
const categoriesRoutes = require("./categories.routes");
const ordersRoutes = require("./orders.routes");

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/orders", ordersRoutes);

// 404 cho API routes không tìm thấy
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

module.exports = router;
