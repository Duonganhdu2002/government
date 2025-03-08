/**
 * routes/mediaFilesRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý file media.
 * Các route này cho phép lấy danh sách, lấy chi tiết theo ID, tạo mới,
 * cập nhật và xóa một bản ghi file media.
 */

const express = require('express');
const router = express.Router();
const mediaFilesController = require('../controllers/mediaFilesController');

// Lấy danh sách tất cả các file media
router.get('/', mediaFilesController.getAllMediaFiles);

// Lấy danh sách file media theo application ID
router.get('/by-application/:applicationId', mediaFilesController.getMediaFilesByApplicationId);

// Truy cập trực tiếp nội dung file media theo ID
router.get('/serve/:id', mediaFilesController.serveMediaFile);

// Lấy thông tin chi tiết của file media theo ID
router.get('/:id', mediaFilesController.getMediaFileById);

// Tạo mới một bản ghi file media
router.post('/', mediaFilesController.createMediaFile);

// Cập nhật thông tin của file media theo ID
router.put('/:id', mediaFilesController.updateMediaFile);

// Xóa file media theo ID
router.delete('/:id', mediaFilesController.deleteMediaFile);

module.exports = router;
