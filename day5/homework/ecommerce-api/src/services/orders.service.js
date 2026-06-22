/**
 * Orders Service
 *
 * Business logic cho order CRUD.
 * Pattern: throw error với .statusCode, controller gọi next(err)
 */

"use strict";

const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// ─── Create Order ─────────────────────────────────────────────────────────────

/**
 * Tạo đơn hàng mới.
 *
 * TODO ORD-1: Implement createOrder
 *   Flow phức tạp — đọc kỹ trước khi code:
 *
 *   1. Validate items và lấy product info:
 *      - Dùng Promise.all để fetch tất cả products song song:
 *        const products = await Promise.all(
 *          items.map(item => Product.findById(item.productId))
 *        );
 *      - Nếu bất kỳ product nào null: throw 400 "Product [name] not found"
 *      - Kiểm tra stock: product.stock >= item.quantity
 *        Nếu không đủ: throw 400 "Insufficient stock for [productName]"
 *
 *   2. Build order items với giá tại thời điểm đặt:
 *      const orderItems = items.map((item, index) => ({
 *        product: products[index]._id,
 *        quantity: item.quantity,
 *        priceAtOrder: products[index].price,  // snapshot giá
 *        productName: products[index].name,    // snapshot tên
 *      }));
 *
 *   3. Tạo order:
 *      const order = await Order.create({
 *        customer: customerId,
 *        items: orderItems,
 *        shippingAddress,
 *        note,
 *      });
 *
 *   4. Giảm stock của từng product:
 *      await Promise.all(
 *        items.map((item, index) =>
 *          Product.findByIdAndUpdate(products[index]._id, {
 *            $inc: { stock: -item.quantity }
 *          })
 *        )
 *      );
 *
 *   5. Populate và return order
 *      order.populate("items.product", "name price") và order.populate("customer", "fullName email")
 *
 * Lưu ý: Bước 3 và 4 nên trong transaction (advanced) để tránh race condition.
 *   Với bài tập này, implement tuần tự là đủ.
 *
 * @param {string} customerId
 * @param {{ items: [{productId, quantity}], shippingAddress, note? }} data
 * @returns {Promise<Document>}
 */
async function createOrder(customerId, data) {
  // TODO ORD-1
  const { items, shippingAddress, note } = data;
  const products = await Promise.all(
    items.map((item) => Product.findById(item.productId)),
  );

  products.forEach((product, index) => {
    if (!product) {
      const err = new Error(`Product not found`);
      err.statusCode = 400;
      throw err;
    }

    if (product.stock < items[index].quantity) {
      const err = new Error(`Insufficient stock for ${product.name}`);
      err.statusCode = 400;
      throw err;
    }
  });

  const orderItems = items.map((item, index) => ({
    product: products[index]._id,
    quantity: item.quantity,
    priceAtOrder: products[index].price,
    productName: products[index].name,
  }));

  const order = await Order.create({
    customer: customerId,
    items: orderItems,
    shippingAddress,
    note,
  });

  await Promise.all(
    items.map((item, index) =>
      Product.findByIdAndUpdate(products[index]._id, {
        $inc: {
          stock: -item.quantity,
        },
      }),
    ),
  );

  await order.populate("items.product", "name price");
  await order.populate("customer", "fullName email");

  return order;
}

// ─── Get My Orders ────────────────────────────────────────────────────────────

/**
 * Lấy danh sách orders của user hiện tại.
 *
 * TODO ORD-2: Implement getMyOrders
 *   1. Order.find({ customer: customerId })
 *      .populate("items.product", "name price images")
 *      .sort({ createdAt: -1 })
 *   2. Pagination (page, limit)
 *   3. Return { data, pagination }
 *
 * Hint:
 *   const [data, total] = await Promise.all([
 *     Order.find({ customer: customerId })
 *       .populate("items.product", "name price")
 *       .sort({ createdAt: -1 })
 *       .skip(skip).limit(limit),
 *     Order.countDocuments({ customer: customerId }),
 *   ]);
 *
 * @param {string} customerId
 * @param {{ page, limit }} options
 * @returns {Promise<{ data, pagination }>}
 */
async function getMyOrders(customerId, options = {}) {
  // TODO ORD-2
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Order.find({ customer: customerId })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Order.countDocuments({
      customer: customerId,
    }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Order by ID ──────────────────────────────────────────────────────────

/**
 * Lấy chi tiết 1 order.
 *
 * TODO ORD-3: Implement getOrderById
 *   1. Order.findById(id)
 *      .populate("items.product", "name price images")
 *      .populate("customer", "firstName lastName email")
 *   2. Nếu không tìm thấy: throw 404
 *   3. Ownership check:
 *      - Nếu requesterRole === "admin": được xem tất cả
 *      - Nếu requesterRole !== "admin": chỉ xem order của mình
 *        order.customer._id.toString() !== requesterId -> throw 403
 *   4. Return order
 *
 * @param {string} id - order id
 * @param {string} requesterId - user id từ JWT
 * @param {string} requesterRole - role từ JWT
 * @returns {Promise<Document>}
 */
async function getOrderById(id, requesterId, requesterRole) {
  // TODO ORD-3
  const order = await Order.findById(id)
    .populate("items.product", "name price images")
    .populate("customer", "firstName lastName email");

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  if (
    requesterRole !== "admin" &&
    order.customer._id.toString() !== requesterId
  ) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  return order;
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

/**
 * Hủy đơn hàng (chỉ được khi status === "pending").
 *
 * TODO ORD-4: Implement cancelOrder
 *   1. Tìm order: Order.findById(id)
 *      Nếu không tìm thấy: throw 404
 *   2. Ownership check: order.customer.toString() === customerId
 *      Nếu không phải: throw 403 "You don't have permission to cancel this order"
 *   3. Status check: order.status === "pending"
 *      Nếu không: throw 400 "Only pending orders can be cancelled"
 *   4. Update:
 *      order.status = "cancelled";
 *      order.cancelledAt = new Date();
 *      order.cancelReason = reason;
 *      await order.save();
 *   5. Hoàn trả stock (restore):
 *      await Promise.all(
 *        order.items.map(item =>
 *          Product.findByIdAndUpdate(item.product, {
 *            $inc: { stock: item.quantity }
 *          })
 *        )
 *      );
 *   6. Return order
 *
 * @param {string} id - order id
 * @param {string} customerId - user id từ JWT
 * @param {string} reason - lý do hủy
 * @returns {Promise<Document>}
 */
async function cancelOrder(id, customerId, reason) {
  // TODO ORD-4
  const order = await Order.findById(id);

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  if (order.customer.toString() !== customerId) {
    const err = new Error("You don't have permission to cancel this order");
    err.statusCode = 403;
    throw err;
  }

  if (order.status !== "pending") {
    const err = new Error("Only pending orders can be cancelled");
    err.statusCode = 400;
    throw err;
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason;

  await order.save();

  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndDelete(item.product, {
        $inc: { stock: item.quantity },
      }),
    ),
  );

  return order;
}

// ─── Get All Orders (admin) ───────────────────────────────────────────────────

/**
 * Lấy tất cả orders (admin only).
 *
 * TODO ORD-5: Implement getAllOrders
 *   1. Build query từ filters:
 *      - status: filter theo order status
 *      - customerId: filter theo customer
 *      - fromDate / toDate: filter theo createdAt
 *   2. Order.find(query)
 *      .populate("customer", "firstName lastName email")
 *      .populate("items.product", "name")
 *      .sort({ createdAt: -1 })
 *      .skip(skip).limit(limit)
 *   3. Return { data, pagination }
 *
 * Hint — date filter:
 *   if (filters.fromDate || filters.toDate) {
 *     query.createdAt = {};
 *     if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
 *     if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
 *   }
 *
 * @param {object} filters - { status, customerId, fromDate, toDate }
 * @param {{ page, limit }} options
 * @returns {Promise<{ data, pagination }>}
 */
async function getAllOrders(filters = {}, options = {}) {
  // TODO ORD-5
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.customerId) {
    query.customer = filters.customerId;
  }

  if (filters.fromDate || filters.toDate) {
    query.createdAt = {};

    if (filters.fromDate) {
      query.createdAt.$gte = new Date(filters.fromDate);
    }

    if (filters.toDate) {
      query.createdAt.$lte = new Date(filters.toDate);
    }
  }

  const [data, total] = await Promise.all([
    Order.find(query)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Order.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
};
