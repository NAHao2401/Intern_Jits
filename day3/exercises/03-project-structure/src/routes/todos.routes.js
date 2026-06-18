/**
 * TODO: Wire up routes cho todos
 *
 * Các route cần implement:
 * GET    /           -> todosController.getAll      (validate query)
 * POST   /           -> todosController.create      (validate body)
 * GET    /:id        -> todosController.getById
 * PATCH  /:id/complete -> todosController.toggleComplete  <- PHẢI đặt TRƯỚC /:id
 * PATCH  /:id        -> todosController.update      (validate body)
 * DELETE /:id        -> todosController.remove
 *
 * Lưu ý: /:id/complete phải đặt TRƯỚC /:id
 * Nếu đặt sau, Express sẽ match "complete" như là id
 */

const router = require("express").Router();
const validate = require("../middleware/validate");
const { createTodoSchema, updateTodoSchema, todoQuerySchema } = require("../schemas/todo.schema");
const todosController = require("../controllers/todos.controller");

// TODO: wire up routes
// GET /
router.get("/", validate(todoQuerySchema, "query"), todosController.getAll);

// POST /
router.post("/", validate(createTodoSchema), todosController.create);

// PATCH /:id/complete - phải trước /:id
router.patch("/:id/complete", todosController.toggleComplete);

// GET /:id
router.get("/:id", todosController.getById);

// PATCH /:id
router.patch("/:id", validate(updateTodoSchema), todosController.update);

// DELETE /:id
router.delete("/:id", todosController.remove);

module.exports = router;
