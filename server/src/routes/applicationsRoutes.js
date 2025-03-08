/**
 * routes/applicationsRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý đơn ứng dụng.
 * Bao gồm các route công khai (lấy danh sách, thống kê) và các route
 * bảo vệ (yêu cầu xác thực token) để lấy, tạo, cập nhật và xóa đơn ứng dụng.
 */

const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { verifyToken, isCitizen } = require('../middleware/auth.middleware');

// --- Các route công khai ---
// Lấy danh sách tất cả các đơn ứng dụng
router.get('/', applicationsController.getAllApplications);

// Lấy thống kê các đơn ứng dụng (ví dụ: tổng số, trạng thái, v.v.)
router.get('/stats/summary', applicationsController.getApplicationStatistics);

// --- Các route yêu cầu xác thực ---
// Lấy danh sách các đơn ứng dụng của người dùng hiện tại (chỉ dành cho người dân)
router.get('/current-user', verifyToken, isCitizen, applicationsController.getCurrentUserApplications);

// Lấy danh sách đơn ứng dụng theo ID của công dân
router.get('/citizen/:citizenId', applicationsController.getApplicationsByCitizenId);

// Lấy thông tin chi tiết của một đơn ứng dụng theo ID
router.get('/:id', applicationsController.getApplicationById);

// Tạo mới một đơn ứng dụng (yêu cầu xác thực)
router.post('/', verifyToken, applicationsController.createApplication);

// Cập nhật thông tin của một đơn ứng dụng theo ID (yêu cầu xác thực)
router.put('/:id', verifyToken, applicationsController.updateApplication);

// Xóa một đơn ứng dụng theo ID (yêu cầu xác thực)
router.delete('/:id', verifyToken, applicationsController.deleteApplication);

module.exports = router;
