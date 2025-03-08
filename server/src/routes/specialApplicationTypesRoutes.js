/**
 * routes/specialApplicationTypesRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý loại hình đơn ứng dụng đặc biệt.
 * Bao gồm các route để lấy danh sách, lấy chi tiết, lấy theo loại đơn ứng dụng,
 * tạo mới, cập nhật và xóa loại đơn ứng dụng đặc biệt.
 * Các thao tác tạo, cập nhật và xóa chỉ dành cho Admin.
 */

const express = require('express');
const router = express.Router();
const specialApplicationTypesController = require('../controllers/specialApplicationTypesController');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Lấy danh sách tất cả loại đơn ứng dụng đặc biệt
router.get('/', specialApplicationTypesController.getAllSpecialApplicationTypes);

// Lấy thông tin chi tiết của loại đơn ứng dụng đặc biệt theo ID
router.get('/:id', specialApplicationTypesController.getSpecialApplicationTypeById);

// Lấy danh sách loại đơn ứng dụng đặc biệt theo ID của loại đơn ứng dụng
router.get('/by-application-type/:applicationTypeId', specialApplicationTypesController.getSpecialApplicationTypesByAppTypeId);

// Tạo mới một loại đơn ứng dụng đặc biệt (chỉ dành cho Admin)
router.post('/', verifyToken, isAdmin, specialApplicationTypesController.createSpecialApplicationType);

// Cập nhật loại đơn ứng dụng đặc biệt theo ID (chỉ dành cho Admin)
router.put('/:id', verifyToken, isAdmin, specialApplicationTypesController.updateSpecialApplicationType);

// Xóa loại đơn ứng dụng đặc biệt theo ID (chỉ dành cho Admin)
router.delete('/:id', verifyToken, isAdmin, specialApplicationTypesController.deleteSpecialApplicationType);

module.exports = router;
