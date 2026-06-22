/**
 * Orders Controller
 */

"use strict";

const ordersService = require("../services/orders.service");

const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const result = await ordersService.getMyOrders(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await ordersService.cancelOrder(
      req.params.id,
      req.user.id,
      req.body.reason
    );
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await ordersService.getAllOrders(filters, { page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders };
