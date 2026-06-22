/**
 * Product Routes
 * GET    /api/products
 * POST   /api/products              (admin)
 * GET    /api/products/:id
 * PUT    /api/products/:id          (admin)
 * DELETE /api/products/:id          (admin)
 * POST   /api/products/:id/ratings  (auth)
 * GET    /api/products/:id/stats
 */

"use strict";

const router = require("express").Router();
const productsController = require("../controllers/products.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  createProductSchema,
  updateProductSchema,
  addRatingSchema,
  listProductsSchema,
} = require("../schemas/product.schema");

router.get("/", validate(listProductsSchema, "query"), productsController.getProducts);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  productsController.create
);

router.get("/:id", productsController.getById);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProductSchema),
  productsController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productsController.deleteProduct
);

router.post(
  "/:id/ratings",
  authenticate,
  validate(addRatingSchema),
  productsController.addRating
);

router.get("/:id/stats", productsController.getStats);

module.exports = router;
