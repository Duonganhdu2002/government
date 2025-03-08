/**
 * routes/notificationsRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý thông báo (notifications).
 * Các route này cho phép lấy danh sách, lấy chi tiết, tạo mới,
 * cập nhật và xóa thông báo.
 */

const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// Lấy danh sách tất cả các thông báo
router.get('/', notificationsController.getAllNotifications);

// Lấy thông báo theo ID
router.get('/:id', notificationsController.getNotificationById);

// Tạo mới một thông báo
router.post('/', notificationsController.createNotification);

// Cập nhật thông báo theo ID
router.put('/:id', notificationsController.updateNotification);

// Xóa một thông báo theo ID
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
