const Joi = require("joi");

/**
 * TODO: Định nghĩa các schema cho todo operations
 *
 * createTodoSchema:
 * - title   : string, 1-200 ký tự sau trim, bắt buộc
 * - priority: "low" | "medium" | "high", default "medium"
 *
 * updateTodoSchema:
 * - title    : string, 1-200 ký tự, không bắt buộc
 * - priority : "low" | "medium" | "high", không bắt buộc
 * - completed: boolean, không bắt buộc
 * - ít nhất 1 field (dùng .min(1))
 *
 * todoQuerySchema (validate req.query):
 * - status  : "all" | "active" | "completed", default "all"
 * - priority: "low" | "medium" | "high", không bắt buộc
 * - search  : string, max 100 ký tự, không bắt buộc
 * - sort    : "createdAt" | "priority" | "title", default "createdAt"
 * - order   : "asc" | "desc", default "asc"
 */

const createTodoSchema = Joi.object({
  // TODO: define
  title: Joi.string().trim().min(1).max(200).required(),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
});

const updateTodoSchema = Joi.object({
  // TODO: define
  title: Joi.string().trim().min(1).max(200),
  priority: Joi.string().valid("low", "medium", "high"),
  completed: Joi.boolean(),
}).min(1);

const todoQuerySchema = Joi.object({
  // TODO: define
  status: Joi.string().valid("all", "active", "completed").default("all"),
  priority: Joi.string().valid("low", "medium", "high"),
  search: Joi.string().max(100),
  sort: Joi.string()
    .valid("createdAt", "priority", "title")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("asc"),
});

module.exports = { createTodoSchema, updateTodoSchema, todoQuerySchema };
