/**
 * routes/processingHistoryRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý lịch sử xử lý (processing history).
 * Các route này cho phép lấy danh sách, lấy chi tiết, tạo mới, cập nhật và xóa bản ghi lịch sử xử lý.
 */

const express = require('express');
const router = express.Router();
const processingHistoryController = require('../controllers/processingHistoryController');

// Lấy danh sách tất cả các bản ghi lịch sử xử lý
router.get('/', processingHistoryController.getAllProcessingHistory);

// Lấy thông tin chi tiết của một bản ghi lịch sử xử lý theo ID
router.get('/:id', processingHistoryController.getProcessingHistoryById);

// Tạo mới một bản ghi lịch sử xử lý
router.post('/', processingHistoryController.createProcessingHistory);

// Cập nhật bản ghi lịch sử xử lý theo ID
router.put('/:id', processingHistoryController.updateProcessingHistory);

// Xóa bản ghi lịch sử xử lý theo ID
router.delete('/:id', processingHistoryController.deleteProcessingHistory);

module.exports = router;
