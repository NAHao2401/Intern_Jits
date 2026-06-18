const notesService = require("../services/notes.service");

/**
 * TODO: Implement getMyNotes
 * GET /api/notes
 * - userId từ req.user.userId (set bởi authenticate middleware)
 * - filter từ req.query (đã validate)
 * - Gọi notesService.getUserNotes(userId, req.query)
 * - Response 200: { success: true, data: notes, total: notes.length }
 */
async function getMyNotes(req, res, next) {
  try {
    // TODO: implement
    const notes = await notesService.getUserNotes(req.user.userId, req.query);

    res.status(200).json({
      success: true,
      data: notes,
      total: notes.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * TODO: Implement getNoteById
 * GET /api/notes/:id
 * - Gọi notesService.getNoteById(id, req.user.userId)
 * - Response 200: { success: true, data: note }
 * - Nếu note không phải của user -> service throw 403 -> error handler xử lý
 */
async function getNoteById(req, res, next) {
  try {
    // TODO: implement
    const note = await notesService.getNoteById(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * TODO: Implement createNote
 * POST /api/notes
 * - Gọi notesService.createNote({ userId: req.user.userId, ...req.body })
 * - Response 201: { success: true, data: note, message: "Note created successfully" }
 */
async function createNote(req, res, next) {
  try {
    // TODO: implement
    const note = await notesService.createNote({
      userId: req.user.userId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: note,
      message: "Note created successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * TODO: Implement updateNote
 * PUT /api/notes/:id
 * - Gọi notesService.updateNote(id, req.body, req.user.userId)
 * - Response 200: { success: true, data: note, message: "Note updated" }
 */
async function updateNote(req, res, next) {
  try {
    // TODO: implement
    const note = await notesService.updateNote(
      req.params.id,
      req.body,
      req.user.userId,
    );

    res.status(200).json({
      success: true,
      data: note,
      message: "Note updated",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * TODO: Implement deleteNote
 * DELETE /api/notes/:id
 * - Gọi notesService.deleteNote(id, req.user.userId)
 * - Response 200: { success: true, message: "Note deleted" }
 */
async function deleteNote(req, res, next) {
  try {
    // TODO: implement
    await notesService.deleteNote(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: "Note deleted",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * TODO: Implement getAllNotes (admin only)
 * GET /api/admin/notes
 * - Gọi notesService.getAllNotes(req.query)
 * - Response 200: { success: true, data: notes, total: notes.length }
 */
async function getAllNotes(req, res, next) {
  try {
    // TODO: implement
    const notes = await notesService.getAllNotes(req.query);

    res.status(200).json({
      success: true,
      data: notes,
      total: notes.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getAllNotes,
};
