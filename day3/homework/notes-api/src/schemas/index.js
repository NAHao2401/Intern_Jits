const Joi = require("joi");
const { emitWarning, title } = require("node:process");

/**
 * TODO: Định nghĩa tất cả schemas
 */

// Auth
const registerSchema = Joi.object({
  // TODO: name (2-50), email, password (min 8, có uppercase + số)
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    .required(),
});

const loginSchema = Joi.object({
  // TODO: email, password
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Notes
const createNoteSchema = Joi.object({
  // TODO:
  // - title  : string, 1-200 ký tự, bắt buộc
  // - content: string, max 10000 ký tự, không bắt buộc, default ""
  // - tags   : array of string, mỗi tag max 30 ký tự, không bắt buộc, default []
  title: Joi.string().trim().min(1).max(200).required(),
  content: Joi.string().max(10000).default(""),
  tags: Joi.array().items(Joi.string().max(30)).default([]),
});

const updateNoteSchema = Joi.object({
  // TODO: giống createNoteSchema nhưng không bắt buộc, phải có ít nhất 1 field
  title: Joi.string().trim().min(1).max(200),
  content: Joi.string().max(10000),
  tags: Joi.array().items(Joi.string().max(30)),
}).min(1);

const noteQuerySchema = Joi.object({
  // TODO:
  // - tag: string, không bắt buộc (lọc theo tag)
  // - q  : string, max 100 ký tự, không bắt buộc (full-text search)
  tag: Joi.string(),
  q: Joi.string().max(100),
});

module.exports = {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
};
