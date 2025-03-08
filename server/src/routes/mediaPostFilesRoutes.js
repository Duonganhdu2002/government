/**
 * routes/mediaPostFilesRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý file media liên quan đến bài viết.
 * Bao gồm các route để lấy danh sách, lấy theo ID, lấy file theo post ID,
 * upload file (yêu cầu xác thực) và xóa file.
 */

const express = require('express');
const router = express.Router();
const mediaPostFilesController = require('../controllers/mediaPostFilesController');
const { verifyToken } = require('../middleware/auth.middleware');

// Lấy danh sách tất cả các file media liên quan đến bài viết
router.get('/', mediaPostFilesController.getAllMediaPostFiles);

// Lấy thông tin chi tiết của file media theo ID
router.get('/:id', mediaPostFilesController.getMediaPostFileById);

// Lấy danh sách file media theo post ID
router.get('/by-post/:postId', mediaPostFilesController.getMediaFilesByPostId);

// Upload file cho bài viết (yêu cầu xác thực, dành cho Admin hoặc nhân viên cơ quan)
router.post('/upload', verifyToken, mediaPostFilesController.uploadPostFiles);

// Xóa file media theo ID (yêu cầu xác thực)
router.delete('/:id', verifyToken, mediaPostFilesController.deleteMediaPostFile);

module.exports = router;
