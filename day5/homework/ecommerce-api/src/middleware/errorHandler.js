/**
 * Global Error Handler Middleware
 *
 * Xử lý tất cả các loại error:
 *   1. Mongoose CastError       -> 400 (invalid ObjectId)
 *   2. Mongoose ValidationError -> 400 (schema validation fail)
 *   3. MongoServerError 11000   -> 409 (duplicate key)
 *   4. Custom errors với .statusCode
 *   5. JWT errors               -> 401
 *   6. Fallback                 -> 500
 *
 * Không expose internal error details ra client.
 */

"use strict";

const errorHandler = (err, req, res, next) => {
  // Log full error cho developer
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === "development") {
      console.error(err.stack);
    }
  }

  let statusCode = 500;
  let message = "Internal Server Error";
  let details = null;

  // ─── Mongoose CastError (invalid ObjectId) ──────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}"`;
  }

  // ─── Mongoose ValidationError (schema validation) ───────────────────────
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ─── MongoDB Duplicate Key Error ─────────────────────────────────────────
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // ─── Custom Application Errors (thrown từ services) ─────────────────────
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ─── Build Response ───────────────────────────────────────────────────────

  const response = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  // Chỉ trả stack trong development
  if (process.env.NODE_ENV === "development") {
    response.debug = {
      name: err.name,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
