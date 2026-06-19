/**
 * Express app configuration
 * Tách khỏi index.js để dễ test (import app mà không start server)
 */

require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Parse JSON body
app.use(express.json());

// Health check (không cần auth)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount tất cả routes dưới /api
app.use("/api", routes);

// 404 handler — phải đặt sau tất cả routes
app.use(notFoundHandler);

// Global error handler — phải đặt cuối cùng, sau 404
app.use(errorHandler);

module.exports = app;
