/**
 * Comments Routes
 *
 * GET    /api/comments/post/:postId    — lấy comments của một post (public)
 * POST   /api/comments/post/:postId    — thêm comment vào post (cần auth)
 * DELETE /api/comments/:commentId      — xóa comment (cần auth + ownership)
 */

const router = require("express").Router();
const commentsController = require("../controllers/comments.controller");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const { createCommentSchema } = require("../schemas/comment.schema");

// Public: xem comments của post
router.get("/post/:postId", commentsController.getCommentsByPost);

// Protected: thêm comment
router.post(
  "/post/:postId",
  authenticate,
  validate(createCommentSchema),
  commentsController.addComment
);

// Protected: xóa comment (chính chủ hoặc admin)
router.delete("/:commentId", authenticate, commentsController.deleteComment);

module.exports = router;
