/**
 * Order Routes
 * POST   /api/orders                (auth — customer tạo đơn)
 * GET    /api/orders/my             (auth — xem đơn của mình)
 * GET    /api/orders                (admin — xem tất cả đơn)
 * GET    /api/orders/:id            (auth — xem chi tiết, ownership check trong service)
 * PATCH  /api/orders/:id/cancel     (auth — hủy đơn, chỉ pending)
 */

"use strict";

const router = require("express").Router();
const ordersController = require("../controllers/orders.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  createOrderSchema,
  cancelOrderSchema,
  listOrdersSchema,
} = require("../schemas/order.schema");

// Tất cả order routes đều yêu cầu authenticate
router.use(authenticate);

// /my phải đặt TRƯỚC /:id để không bị match "my" như ObjectId
router.get("/my", ordersController.getMyOrders);

router.get(
  "/",
  authorize("admin"),
  validate(listOrdersSchema, "query"),
  ordersController.getAllOrders
);

router.post("/", validate(createOrderSchema), ordersController.createOrder);

router.get("/:id", ordersController.getOrderById);

router.patch(
  "/:id/cancel",
  validate(cancelOrderSchema),
  ordersController.cancelOrder
);

module.exports = router;
