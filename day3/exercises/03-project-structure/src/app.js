/**
 * Express app configuration
 * Tách khỏi index.js để dễ test (import app mà không start server)
 */

const express = require("express");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Global middleware
app.use(express.json());

// Request logger (optional - thêm nếu muốn)
// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on("finish", () => {
//     console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
//   });
//   next();
// });

// Routes
app.use("/api", routes);

// 404 và Error handler - PHẢI đặt cuối cùng
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
