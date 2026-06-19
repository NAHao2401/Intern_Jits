/**
 * Joi schemas cho comment endpoints
 */

const Joi = require("joi");

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).trim().required(),
});

module.exports = { createCommentSchema };
