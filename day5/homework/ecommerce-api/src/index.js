/**
 * E-commerce API — Day 5 Homework
 * Entry point
 */

"use strict";
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", routes);

// ─── Error Handler (phải đặt SAU routes) ─────────────────────────────────────

app.use(errorHandler);

// ─── Database & Server ────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  if (!MONGODB_URI) {
    console.error(
      "MONGODB_URI is not set. Copy .env.example to .env and fill in values.",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${MONGODB_URI}`);

    app.listen(PORT, () => {
      console.log(`E-commerce API running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log();
      console.log("Endpoints:");
      console.log("  POST   /api/auth/register");
      console.log("  POST   /api/auth/login");
      console.log("  GET    /api/auth/me");
      console.log("  GET    /api/products");
      console.log("  POST   /api/products              (admin)");
      console.log("  GET    /api/products/:id");
      console.log("  PUT    /api/products/:id          (admin)");
      console.log("  DELETE /api/products/:id          (admin)");
      console.log("  POST   /api/products/:id/ratings  (auth)");
      console.log("  GET    /api/products/:id/stats");
      console.log("  GET    /api/categories");
      console.log("  POST   /api/categories            (admin)");
      console.log("  GET    /api/categories/:id/products");
      console.log("  POST   /api/orders                (auth)");
      console.log("  GET    /api/orders/my             (auth)");
      console.log("  GET    /api/orders/:id            (auth/admin)");
      console.log("  PATCH  /api/orders/:id/cancel     (auth)");
      console.log("  GET    /api/orders                (admin)");
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
