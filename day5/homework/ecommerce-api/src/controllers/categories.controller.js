/**
 * Categories Controller
 */

"use strict";

const categoriesService = require("../services/categories.service");

const getAll = async (req, res, next) => {
  try {
    const categories = await categoriesService.getAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoriesService.getById(req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await categoriesService.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await categoriesService.update(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoriesService.deleteCategory(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const result = await categoriesService.getProductsByCategory(
      req.params.id,
      req.query
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, deleteCategory, getProductsByCategory };
