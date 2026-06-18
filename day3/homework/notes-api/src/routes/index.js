const router = require("express").Router();
const { validate, authenticate, authorize } = require("../middleware");
const { registerSchema, loginSchema, createNoteSchema, updateNoteSchema, noteQuerySchema } = require("../schemas");
const authController = require("../controllers/auth.controller");
const notesController = require("../controllers/notes.controller");

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notes-api", uptime: process.uptime() });
});

// ---- Auth ----
// TODO: wire up auth routes
// POST /auth/register -> validate(registerSchema), authController.register
// POST /auth/login    -> validate(loginSchema), authController.login
router.post("/auth/register", validate(registerSchema), authController.register);
router.post("/auth/login", validate(loginSchema), authController.login);

// ---- Notes (cần đăng nhập) ----
// TODO: wire up notes routes
// Tất cả đều cần authenticate middleware
// GET    /notes       -> validate query, notesController.getMyNotes
// POST   /notes       -> validate body, notesController.createNote
// GET    /notes/:id   -> notesController.getNoteById
// PUT    /notes/:id   -> validate body, notesController.updateNote
// DELETE /notes/:id   -> notesController.deleteNote
router.get("/notes", authenticate, validate(noteQuerySchema, "query"), notesController.getMyNotes);
router.post("/notes", authenticate, validate(createNoteSchema), notesController.createNote);
router.get("/notes/:id", authenticate, notesController.getNoteById);
router.put("/notes/:id", authenticate, validate(updateNoteSchema), notesController.updateNote);
router.delete("/notes/:id", authenticate, notesController.deleteNote);

// ---- Admin (cần role admin) ----
// TODO: wire up admin routes
// GET /admin/notes -> authenticate + authorize("admin"), notesController.getAllNotes
router.get("/admin/notes", authenticate, authorize("admin"), notesController.getAllNotes);

module.exports = router;
