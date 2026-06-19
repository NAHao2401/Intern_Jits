/**
 * Comments Service
 * Business logic cho comment CRUD
 *
 * Một Comment thuộc về một Post và một User (author)
 */

const Comment = require("../models/comment.model");
const Post = require("../models/post.model");

// ============================================================
// TODO: getCommentsByPost
// ============================================================
// Yêu cầu:
// 1. Nhận vào postId
// 2. Kiểm tra post tồn tại (Post.findById(postId))
//    - Không tìm thấy -> throw 404 "Post not found"
// 3. Lấy tất cả comments của post, sort cũ nhất trước (chronological)
// 4. Populate author (chỉ lấy name)
// 5. Dùng .lean() vì chỉ đọc
//
// Hint: Comment.find({ post: postId })
//   .sort({ createdAt: 1 })
//   .populate({ path: "author", select: "name" })
//   .lean()

async function getCommentsByPost(postId) {
  // TODO: implement getCommentsByPost
  const post = await Post.findById(postId);

  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  const comments = (await Comment.find({ post: postId }))
    .sort({ createdAt: 1 })
    .populate({
      path: "author",
      select: "name",
    })
    .lean();

  return comments;
}

// ============================================================
// TODO: addComment
// ============================================================
// Yêu cầu:
// 1. Nhận vào postId, content, authorId (từ req.user.userId)
// 2. Kiểm tra post tồn tại và đang published
//    - Không tìm thấy hoặc chưa published -> throw 404 "Post not found or not published"
// 3. Tạo comment: Comment.create({ content, post: postId, author: authorId })
// 4. Populate author (name) trước khi trả về
//
// Hint: const comment = await Comment.create({ content, post: postId, author: authorId });
//       await comment.populate({ path: "author", select: "name" });
//       return comment;
//
// Câu hỏi: tại sao chỉ cho comment vào published post?

async function addComment(postId, { content }, authorId) {
  // TODO: implement addComment với check post published
  const post = await Post.findById({ _id: postId, published: true });

  if (!post) {
    const err = new Error("Post not found or not published");
    err.statusCode(404);
    throw err;
  }

  const comment = Comment.create({
    content,
    post: postId,
    author: authorId,
  });

  await comment.populate({ path: "author", select: "name" });

  return comment;
}

// ============================================================
// TODO: deleteComment
// ============================================================
// Yêu cầu:
// 1. Nhận vào commentId, currentUserId, currentUserRole
// 2. Tìm comment: Comment.findById(commentId)
//    - Không tìm thấy -> throw 404 "Comment not found"
// 3. Check ownership: comment.author.toString() !== currentUserId.toString()
//    Nếu không phải owner VÀ không phải admin -> throw 403
// 4. Xóa: Comment.findByIdAndDelete(commentId)
// 5. Trả về { message: "Comment deleted" }
//
// Hint: const comment = await Comment.findById(commentId);

async function deleteComment(commentId, currentUserId, currentUserRole) {
  // TODO: implement deleteComment với ownership check
  const comment = await Comment.findById(commentId);

  if (!comment) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = comment.author.toString() === currentUserId.toString();
  const isAdmin = currentUserRole === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  await Comment.findByIdAndDelete(commentId);

  return {
    message: "Comment deleted",
  };
}

module.exports = {
  getCommentsByPost,
  addComment,
  deleteComment,
};
