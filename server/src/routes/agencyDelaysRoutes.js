/**
 * src/routes/agencyDelaysRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý thông tin trễ của cơ quan.
 * Cho phép lấy danh sách, lấy chi tiết theo ID, tạo mới, cập nhật và xóa bản ghi về sự chậm trễ.
 */

const express = require('express');
const router = express.Router();
const agencyDelaysController = require('../controllers/agencyDelaysController');

// Lấy danh sách tất cả các bản ghi trễ của cơ quan
router.get('/', agencyDelaysController.getAllAgencyDelays);

// Lấy thông tin chi tiết của bản ghi trễ theo ID
router.get('/:id', agencyDelaysController.getAgencyDelayById);

// Tạo mới một bản ghi trễ cho cơ quan
router.post('/', agencyDelaysController.createAgencyDelay);

// Cập nhật bản ghi trễ của cơ quan theo ID
router.put('/:id', agencyDelaysController.updateAgencyDelay);

// Xóa một bản ghi trễ của cơ quan theo ID
router.delete('/:id', agencyDelaysController.deleteAgencyDelay);

module.exports = router;
