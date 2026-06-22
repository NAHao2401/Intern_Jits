/**
 * Joi validation schemas — Auth
 */

"use strict";

const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().required(),
  lastName: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("customer", "admin").default("customer"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
