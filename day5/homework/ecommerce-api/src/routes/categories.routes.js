/**
 * Category Routes
 * GET    /api/categories
 * POST   /api/categories                    (admin)
 * GET    /api/categories/:id
 * PUT    /api/categories/:id                (admin)
 * DELETE /api/categories/:id                (admin)
 * GET    /api/categories/:id/products
 */

"use strict";

const router = require("express").Router();
const categoriesController = require("../controllers/categories.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { createCategorySchema, updateCategorySchema } = require("../schemas/category.schema");

router.get("/", categoriesController.getAll);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCategorySchema),
  categoriesController.create
);

router.get("/:id", categoriesController.getById);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateCategorySchema),
  categoriesController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  categoriesController.deleteCategory
);

router.get("/:id/products", categoriesController.getProductsByCategory);

module.exports = router;
