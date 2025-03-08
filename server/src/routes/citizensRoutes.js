/**
 * routes/citizensRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý thông tin công dân.
 * Các route này xử lý việc lấy danh sách (có phân trang), lấy chi tiết theo ID,
 * tạo mới, cập nhật (toàn bộ hoặc từng phần) và xóa thông tin công dân.
 * Sử dụng các middleware để xác thực, kiểm tra quyền (admin hoặc chính chủ)
 * và validate dữ liệu đầu vào.
 */

const express = require('express');
const router = express.Router();
const citizensController = require('../controllers/citizensController');
const { 
  verifyToken, 
  isAdmin, 
  validateCitizenData, 
  validatePartialCitizenData,
  validateIdParam,
  validatePagination
} = require('../middleware');
const { asyncErrorHandler } = require('../middleware/error.middleware');

/**
 * @route GET /api/citizens
 * @desc Lấy danh sách công dân có phân trang
 * @access Private - Chỉ dành cho Admin
 */
router.get(
  '/', 
  verifyToken, 
  isAdmin, 
  validatePagination,
  asyncErrorHandler(citizensController.getAllCitizens)
);

/**
 * @route GET /api/citizens/:id
 * @desc Lấy thông tin công dân theo ID
 * @access Private - Dành cho Admin hoặc chính công dân đó
 */
router.get(
  '/:id', 
  verifyToken, 
  validateIdParam,
  asyncErrorHandler(citizensController.getCitizenById)
);

/**
 * @route POST /api/citizens
 * @desc Tạo mới một công dân
 * @access Private - Chỉ dành cho Admin
 */
router.post(
  '/', 
  verifyToken, 
  isAdmin, 
  validateCitizenData,
  asyncErrorHandler(citizensController.createCitizen)
);

/**
 * @route PUT /api/citizens/:id
 * @desc Cập nhật thông tin của một công dân (toàn bộ)
 * @access Private - Dành cho Admin hoặc chính công dân đó
 */
router.put(
  '/:id', 
  verifyToken, 
  validateIdParam,
  validateCitizenData,
  asyncErrorHandler(citizensController.updateCitizen)
);

/**
 * @route PATCH /api/citizens/:id
 * @desc Cập nhật một phần thông tin của công dân - Đã đơn giản hóa
 * @access Private - Dành cho Admin hoặc chính công dân đó
 */
router.patch(
  '/:id', 
  verifyToken, 
  validateIdParam,
  validatePartialCitizenData,
  asyncErrorHandler(citizensController.updateCitizen)
);

/**
 * @route DELETE /api/citizens/:id
 * @desc Xóa thông tin của một công dân
 * @access Private - Chỉ dành cho Admin
 */
router.delete(
  '/:id', 
  verifyToken, 
  isAdmin, 
  validateIdParam,
  asyncErrorHandler(citizensController.deleteCitizen)
);

module.exports = router;
