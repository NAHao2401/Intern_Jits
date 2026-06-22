/**
 * Order Model
 *
 * Fields:
 *   customer (ref User), items ([{product, quantity, priceAtOrder}]),
 *   status, shippingAddress, timestamps
 *
 * Design decisions:
 *   - items: embedded array (order items bất biến sau khi tạo — không thay đổi)
 *   - priceAtOrder: lưu giá tại thời điểm đặt (price product có thể thay đổi)
 *   - totalAmount: virtual (tính từ items, không cần lưu — nhất quán tự động)
 *   - shippingAddress: embedded object (snapshot địa chỉ tại thời điểm đặt)
 */

"use strict";

const mongoose = require("mongoose");

// ─── Order Item Sub-Schema ────────────────────────────────────────────────────

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    priceAtOrder: {
      type: Number,
      required: [true, "Price at order time is required"],
      min: [0, "Price cannot be negative"],
    },
    productName: {
      // Snapshot tên product — vì tên product có thể thay đổi sau
      type: String,
      required: true,
    },
  },
  { _id: false } // không cần _id cho sub-document
);

// ─── Shipping Address Sub-Schema ──────────────────────────────────────────────

const shippingAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: [true, "Street is required"] },
    city: { type: String, required: [true, "City is required"] },
    district: String,
    recipientName: { type: String, required: [true, "Recipient name is required"] },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: [/^[0-9]{10,11}$/, "Phone number is not valid"],
    },
  },
  { _id: false }
);

// ─── Order Schema ─────────────────────────────────────────────────────────────

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Order must have at least one item",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "shipped", "delivered", "cancelled"],
        message: '"{VALUE}" is not a valid order status',
      },
      default: "pending",
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    note: {
      type: String,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// ─── Virtual: totalAmount ─────────────────────────────────────────────────────

orderSchema.virtual("totalAmount").get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce(
    (sum, item) => sum + item.priceAtOrder * item.quantity,
    0
  );
});

// ─── Model ────────────────────────────────────────────────────────────────────

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
