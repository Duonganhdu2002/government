/**
 * routes/authRoutes.js
 *
 * Định nghĩa các endpoint cho xác thực người dùng.
 * Bao gồm đăng ký, đăng nhập, làm mới token, đăng xuất, thay đổi mật khẩu và lấy thông tin người dùng hiện tại.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth.middleware');

// Đăng ký người dùng mới
router.post('/register', authController.register);

// Đăng ký tài khoản staff mới (chỉ admin)
router.post('/register-staff', authController.registerStaff);

// Đăng nhập người dùng đã có
router.post('/login', authController.login);

// Đăng nhập cho staff bằng staffId hoặc employee code
router.post('/staff-login', authController.loginStaffById);

// Làm mới access token sử dụng refresh token
router.post('/refresh', authController.refreshToken);

// Đăng xuất và hủy token refresh
router.post('/logout', authController.logout);

// Thay đổi mật khẩu (yêu cầu cung cấp citizenid, oldPassword, newPassword)
router.post('/change-password', authController.changePassword);

// Thay đổi mật khẩu cho staff (yêu cầu cung cấp staffId, oldPassword, newPassword)
router.post('/staff-change-password', authController.staffChangePassword);

// Lấy thông tin người dùng hiện tại dựa trên token (yêu cầu xác thực)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
