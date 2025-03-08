/**
 * middleware/index.js
 *
 * Điểm xuất (export) tập trung của các middleware trong ứng dụng.
 * Giúp việc import middleware vào các file route trở nên gọn gàng và dễ bảo trì.
 */

const authMiddleware = require('./auth.middleware');
const validationMiddleware = require('./validation.middleware');

module.exports = {
  // Các middleware xác thực
  verifyToken: authMiddleware.verifyToken,
  isStaff: authMiddleware.isStaff,
  isAdmin: authMiddleware.isAdmin,
  isCitizen: authMiddleware.isCitizen,
  
  // Các middleware kiểm tra và validate dữ liệu
  validateCitizenData: validationMiddleware.validateCitizenData,
  validatePartialCitizenData: validationMiddleware.validatePartialCitizenData,
  validateApplicationData: validationMiddleware.validateApplicationData,
  validateIdParam: validationMiddleware.validateIdParam,
  validatePagination: validationMiddleware.validatePagination
};
