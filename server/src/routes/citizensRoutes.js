/**
 * citizensRoutes.js
 * 
 * Routes for citizen management
 * Handles all HTTP endpoints related to citizen data
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
 * @desc Get all citizens with pagination
 * @access Private - Admin only
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
 * @desc Get citizen by ID
 * @access Private - Admin or same citizen only
 */
router.get(
  '/:id', 
  verifyToken, 
  validateIdParam,
  asyncErrorHandler(citizensController.getCitizenById)
);

/**
 * @route POST /api/citizens
 * @desc Create a new citizen
 * @access Private - Admin only
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
 * @desc Update an existing citizen
 * @access Private - Admin or same citizen only
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
 * @desc Partially update an existing citizen
 * @access Private - Admin or same citizen only
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
 * @desc Delete a citizen
 * @access Private - Admin only
 */
router.delete(
  '/:id', 
  verifyToken, 
  isAdmin, 
  validateIdParam,
  asyncErrorHandler(citizensController.deleteCitizen)
);

module.exports = router;
