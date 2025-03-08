/**
 * src/routes/agenciesRoutes.js
 *
 * Định nghĩa các endpoint CRUD cho quản lý thông tin các cơ quan.
 * Các endpoint này cho phép lấy danh sách, lấy chi tiết theo ID, tạo mới,
 * cập nhật và xóa một cơ quan.
 */

const express = require('express');
const router = express.Router();
const agenciesController = require('../controllers/agenciesController');

// Lấy danh sách tất cả các cơ quan
router.get('/', agenciesController.getAllAgencies);

// Lấy thông tin chi tiết của một cơ quan theo ID
router.get('/:id', agenciesController.getAgencyById);

// Tạo mới một cơ quan
router.post('/', agenciesController.createAgency);

// Cập nhật thông tin của một cơ quan có sẵn theo ID
router.put('/:id', agenciesController.updateAgency);

// Xóa một cơ quan theo ID
router.delete('/:id', agenciesController.deleteAgency);

module.exports = router;
