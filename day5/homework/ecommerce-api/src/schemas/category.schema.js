/**
 * Joi validation schemas — Category
 */

"use strict";

const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  description: Joi.string().max(500).trim(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  description: Joi.string().max(500).trim(),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
