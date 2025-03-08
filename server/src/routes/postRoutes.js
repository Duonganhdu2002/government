/**
 * routes/postRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý bài viết (posts).
 * Các route này cho phép lấy danh sách, lấy bài viết theo danh mục,
 * lấy chi tiết theo ID, tạo mới, cập nhật và xóa bài viết.
 */

const express = require('express');
const router = express.Router();
const postControllers = require('../controllers/postControllers');

// Lấy danh sách tất cả các bài viết
router.get('/', postControllers.getAllPosts);

// Lấy danh sách bài viết theo ID danh mục
router.get('/category/:categoryId', postControllers.getPostsByCategoryId);

// Lấy thông tin chi tiết của bài viết theo ID
router.get('/:id', postControllers.getPostById);

// Tạo mới một bài viết
router.post('/', postControllers.createPost);

// Cập nhật bài viết theo ID
router.put('/:id', postControllers.updatePost);

// Xóa bài viết theo ID
router.delete('/:id', postControllers.deletePost);

module.exports = router;
