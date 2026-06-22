/**
 * Joi validation schemas — Product
 */

"use strict";

const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim().required(),
  description: Joi.string().max(2000).trim(),
  price: Joi.number().min(0).required(),
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "category must be a valid ObjectId" }),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().uri()).max(10),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim(),
  description: Joi.string().max(2000).trim(),
  price: Joi.number().min(0),
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({ "string.pattern.base": "category must be a valid ObjectId" }),
  stock: Joi.number().integer().min(0),
  images: Joi.array().items(Joi.string().uri()).max(10),
}).min(1);

const addRatingSchema = Joi.object({
  score: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().max(500).trim(),
});

const listProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  search: Joi.string().trim().max(100),
  sort: Joi.string().valid("price_asc", "price_desc", "newest", "rating").default("newest"),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  addRatingSchema,
  listProductsSchema,
};
