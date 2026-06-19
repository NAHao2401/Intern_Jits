/**
 * Posts Routes
 *
 * GET    /api/posts              — lấy danh sách posts (public, chỉ published)
 * GET    /api/posts/:id          — xem chi tiết post (public)
 * POST   /api/posts              — tạo post mới (cần auth)
 * PUT    /api/posts/:id          — cập nhật post (cần auth + ownership)
 * DELETE /api/posts/:id          — xóa post (cần auth + ownership)
 * PATCH  /api/posts/:id/publish  — publish post (cần auth + ownership)
 * PATCH  /api/posts/:id/unpublish — unpublish post (cần auth + ownership)
 */

const router = require("express").Router();
const postsController = require("../controllers/posts.controller");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const { createPostSchema, updatePostSchema, postQuerySchema } = require("../schemas/post.schema");

// Public routes
router.get(
  "/",
  validate(postQuerySchema, "query"),
  postsController.getAllPosts
);

router.get("/:id", postsController.getPostById);

// Protected routes (cần đăng nhập)
router.post(
  "/",
  authenticate,
  validate(createPostSchema),
  postsController.createPost
);

router.put(
  "/:id",
  authenticate,
  validate(updatePostSchema),
  postsController.updatePost
);

router.delete("/:id", authenticate, postsController.deletePost);

router.patch("/:id/publish",   authenticate, postsController.publishPost);
router.patch("/:id/unpublish", authenticate, postsController.unpublishPost);

module.exports = router;
