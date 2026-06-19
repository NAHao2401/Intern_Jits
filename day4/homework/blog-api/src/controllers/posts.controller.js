/**
 * Posts Controller
 * Nhận request -> gọi service -> trả response
 */

const postsService = require("../services/posts.service");

async function getAllPosts(req, res, next) {
  try {
    // req.query đã được validate và sanitize bởi validate(postQuerySchema, "query")
    const result = await postsService.getAllPosts(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getPostById(req, res, next) {
  try {
    const post = await postsService.getPostById(req.params.id);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    // req.user.userId từ JWT payload (set bởi authenticate middleware)
    const post = await postsService.createPost(req.user.userId, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const post = await postsService.updatePost(
      req.params.id,
      req.body,
      req.user.userId,
      req.user.role
    );
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const result = await postsService.deletePost(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function publishPost(req, res, next) {
  try {
    const post = await postsService.setPublished(
      req.params.id,
      true,
      req.user.userId,
      req.user.role
    );
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

async function unpublishPost(req, res, next) {
  try {
    const post = await postsService.setPublished(
      req.params.id,
      false,
      req.user.userId,
      req.user.role
    );
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
};
