/**
 * Products Controller
 */

"use strict";

const productsService = require("../services/products.service");

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, sort, ...filters } = req.query;
    const result = await productsService.getProducts(filters, { page, limit, sort });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productsService.getById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const product = await productsService.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productsService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productsService.softDelete(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const addRating = async (req, res, next) => {
  try {
    const product = await productsService.addRating(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await productsService.getStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getById, create, update, deleteProduct, addRating, getStats };
