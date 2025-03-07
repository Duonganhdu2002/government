// routes/postCategoriesRoutes.js
const express = require("express");
const router = express.Router();
const postCategoriesController = require("../controllers/postCategoriesController");
const { verifyToken, isStaff, isAdmin, isCitizen } = require("../middleware");

/**
 * GET all post categories
 * - Example: open to all (no authentication required)
 */
router.get(
  "/",
  verifyToken,
  isCitizen,
  postCategoriesController.getAllPostCategories
);

/**
 * GET post category by ID
 * - Example: open to all
 */
router.get(
  "/:id",
  verifyToken,
  isCitizen,
  postCategoriesController.getPostCategoryById
);

/**
 * CREATE a new post category
 * - Example: only authenticated staff or admin can create
 */
router.post(
  "/",
  verifyToken,
  isStaff,
  postCategoriesController.createPostCategory
);

/**
 * UPDATE an existing post category
 * - Example: only authenticated staff or admin can update
 */
router.put(
  "/:id",
  verifyToken,
  isStaff,
  postCategoriesController.updatePostCategory
);

/**
 * DELETE a post category
 * - Example: only authenticated admin can delete
 */
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  postCategoriesController.deletePostCategory
);

module.exports = router;
