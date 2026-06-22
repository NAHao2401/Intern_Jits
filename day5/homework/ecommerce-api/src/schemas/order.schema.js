/**
 * Joi validation schemas — Order
 */

"use strict";

const Joi = require("joi");

const orderItemSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "productId must be a valid ObjectId" }),
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const shippingAddressSchema = Joi.object({
  street: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  district: Joi.string().trim(),
  recipientName: Joi.string().trim().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required()
    .messages({ "string.pattern.base": "Phone must be 10-11 digits" }),
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: shippingAddressSchema.required(),
  note: Joi.string().max(500).trim(),
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().trim().max(500).required(),
});

const listOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid("pending", "paid", "shipped", "delivered", "cancelled"),
  customerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso().min(Joi.ref("fromDate")),
});

module.exports = {
  createOrderSchema,
  cancelOrderSchema,
  listOrdersSchema,
};
