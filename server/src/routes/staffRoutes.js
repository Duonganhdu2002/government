/**
 * routes/staffRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý thông tin nhân viên (staff).
 * Các route này cho phép lấy danh sách, lấy thông tin chi tiết, tạo mới,
 * cập nhật và xóa nhân viên.
 */

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Lấy danh sách tất cả nhân viên
router.get('/', staffController.getAllStaff);

// Lấy thông tin chi tiết của nhân viên theo ID
router.get('/:id', staffController.getStaffById);

// Tạo mới một nhân viên
router.post('/', staffController.createStaff);

// Cập nhật thông tin của nhân viên theo ID
router.put('/:id', staffController.updateStaff);

// Xóa nhân viên theo ID
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
