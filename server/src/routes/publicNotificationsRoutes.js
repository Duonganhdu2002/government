/**
 * routes/publicNotificationsRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý thông báo công khai (public notifications).
 * Các route này cho phép lấy danh sách, lấy thông báo chi tiết, tạo mới,
 * cập nhật và xóa thông báo công khai.
 */

const express = require('express');
const router = express.Router();
const publicNotificationsController = require('../controllers/publicNotificationsController');

// Lấy danh sách tất cả thông báo công khai
router.get('/', publicNotificationsController.getAllPublicNotifications);

// Lấy thông tin chi tiết của thông báo công khai theo ID
router.get('/:id', publicNotificationsController.getPublicNotificationById);

// Tạo mới một thông báo công khai
router.post('/', publicNotificationsController.createPublicNotification);

// Cập nhật thông báo công khai theo ID
router.put('/:id', publicNotificationsController.updatePublicNotification);

// Xóa thông báo công khai theo ID
router.delete('/:id', publicNotificationsController.deletePublicNotification);

module.exports = router;
