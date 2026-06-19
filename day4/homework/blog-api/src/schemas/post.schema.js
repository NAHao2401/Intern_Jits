/**
 * Joi schemas cho post endpoints
 */

const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().min(5).max(200).trim().required(),
  content: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  published: Joi.boolean().default(false),
});

const updatePostSchema = Joi.object({
  title:   Joi.string().min(5).max(200).trim(),
  content: Joi.string().min(10),
  tags:    Joi.array().items(Joi.string().trim().lowercase()),
}).min(1); // ít nhất 1 field

const postQuerySchema = Joi.object({
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(50).default(10),
  sort:      Joi.string().valid("createdAt", "-createdAt", "title", "-title").default("-createdAt"),
  tag:       Joi.string().trim().lowercase(),
  published: Joi.boolean(),
});

module.exports = { createPostSchema, updatePostSchema, postQuerySchema };
