/**
 * routes/applicationTypesRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý loại hình đơn ứng dụng.
 * Các endpoint bao gồm lấy danh sách, lấy theo ID, tạo mới, cập nhật và xóa.
 */

const express = require('express');
const router = express.Router();
const applicationTypesController = require('../controllers/applicationTypesController');

// Lấy danh sách tất cả các loại đơn ứng dụng
router.get('/', applicationTypesController.getAllApplicationTypes);

// Lấy thông tin chi tiết của một loại đơn ứng dụng theo ID
router.get('/:id', applicationTypesController.getApplicationTypeById);

// Tạo mới một loại đơn ứng dụng
router.post('/', applicationTypesController.createApplicationType);

// Cập nhật thông tin của một loại đơn ứng dụng theo ID
router.put('/:id', applicationTypesController.updateApplicationType);

// Xóa một loại đơn ứng dụng theo ID
router.delete('/:id', applicationTypesController.deleteApplicationType);

module.exports = router;
