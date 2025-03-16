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

// Lấy thống kê cho trang quản trị viên
router.get('/admin/dashboard-stats', staffController.getAdminDashboardStats);

// Lấy thống kê cho trang quản trị viên cụ thể
router.get('/admin/dashboard-stats/:userId', staffController.getAdminDashboardStats);

// Lấy lịch sử đăng nhập của nhân viên
router.get('/admin/login-history/:id', staffController.getStaffLoginHistory);

// Lấy lịch sử xử lý hồ sơ (cho admin)
router.get('/processing-history', staffController.getProcessingHistory);

// GET single staff, UPDATE staff, DELETE staff
router.route('/:id')
  .get(staffController.getStaffById)
  .patch(staffController.updateStaff)
  .delete(staffController.deleteStaff);

// Tạo mới một nhân viên
router.post('/', staffController.createStaff);

module.exports = router;
