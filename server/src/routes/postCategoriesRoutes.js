/**
 * routes/postCategoriesRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý danh mục bài viết (post categories).
 * Các route này cho phép lấy danh sách, lấy chi tiết, tạo mới, cập nhật và xóa danh mục bài viết.
 * Các route sử dụng middleware xác thực để kiểm tra quyền truy cập của người dùng.
 */

const express = require("express");
const router = express.Router();
const postCategoriesController = require("../controllers/postCategoriesController");
const { verifyToken, isStaff, isAdmin, isCitizen } = require("../middleware");

/**
 * Lấy danh sách tất cả danh mục bài viết.
 * Yêu cầu xác thực token và kiểm tra quyền người dùng (dành cho người dân).
 */
router.get(
  "/",
  verifyToken,
  isCitizen,
  postCategoriesController.getAllPostCategories
);

/**
 * Lấy thông tin chi tiết của danh mục bài viết theo ID.
 * Yêu cầu xác thực token và kiểm tra quyền người dùng (dành cho người dân).
 */
router.get(
  "/:id",
  verifyToken,
  isCitizen,
  postCategoriesController.getPostCategoryById
);

/**
 * Tạo mới một danh mục bài viết.
 * Yêu cầu xác thực token và quyền của nhân viên (staff) hoặc admin.
 */
router.post(
  "/",
  verifyToken,
  isStaff,
  postCategoriesController.createPostCategory
);

/**
 * Cập nhật thông tin danh mục bài viết theo ID.
 * Yêu cầu xác thực token và quyền của nhân viên (staff) hoặc admin.
 */
router.put(
  "/:id",
  verifyToken,
  isStaff,
  postCategoriesController.updatePostCategory
);

/**
 * Xóa danh mục bài viết theo ID.
 * Yêu cầu xác thực token và chỉ admin được phép xóa.
 */
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  postCategoriesController.deletePostCategory
);

module.exports = router;
