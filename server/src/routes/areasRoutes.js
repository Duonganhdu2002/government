/**
 * routes/areasRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý thông tin khu vực.
 * Cho phép lấy danh sách, lấy theo ID, tạo mới, cập nhật và xóa một khu vực.
 */

const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areasController');

// Lấy danh sách tất cả các khu vực
router.get('/', areasController.getAllAreas);

// Lấy thông tin chi tiết của một khu vực theo ID
router.get('/:id', areasController.getAreaById);

// Tạo mới một khu vực
router.post('/', areasController.createArea);

// Cập nhật thông tin của một khu vực theo ID
router.put('/:id', areasController.updateArea);

// Xóa một khu vực theo ID
router.delete('/:id', areasController.deleteArea);

module.exports = router;
