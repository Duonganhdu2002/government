/**
 * middleware/index.js
 * 
 * Central export point for all middleware modules
 * Makes importing middleware in routes cleaner
 */

const authMiddleware = require('./auth.middleware');
const validationMiddleware = require('./validation.middleware');

module.exports = {
  // Authentication middleware
  verifyToken: authMiddleware.verifyToken,
  isStaff: authMiddleware.isStaff,
  isAdmin: authMiddleware.isAdmin,
  isCitizen: authMiddleware.isCitizen,
  
  // Validation middleware
  validateCitizenData: validationMiddleware.validateCitizenData,
  validatePartialCitizenData: validationMiddleware.validatePartialCitizenData,
  validateApplicationData: validationMiddleware.validateApplicationData,
  validateIdParam: validationMiddleware.validateIdParam,
  validatePagination: validationMiddleware.validatePagination
};
