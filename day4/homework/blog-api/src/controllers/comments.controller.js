/**
 * Comments Controller
 * Nhận request -> gọi service -> trả response
 */

const commentsService = require("../services/comments.service");

async function getCommentsByPost(req, res, next) {
  try {
    const comments = await commentsService.getCommentsByPost(req.params.postId);
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await commentsService.addComment(
      req.params.postId,
      req.body,
      req.user.userId
    );
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const result = await commentsService.deleteComment(
      req.params.commentId,
      req.user.userId,
      req.user.role
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCommentsByPost, addComment, deleteComment };
