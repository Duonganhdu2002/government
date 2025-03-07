// routes/applicationUploadRoutes.js
const express = require('express');
const router = express.Router();
const applicationUploadController = require('../controllers/applicationUploadController');
const { verifyToken, isCitizen } = require('../middleware/auth.middleware');

/**
 * @route GET /api/application-upload/test
 * @desc Test route to check connectivity
 * @access Public
 */
router.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Application upload route is working',
    timestamp: new Date().toISOString(),
    headers: req.headers['authorization'] ? 'Authorization header present' : 'No authorization header'
  });
});

/**
 * @route POST /api/application-upload
 * @desc Submit new application with file attachments
 * @access Private (citizens only)
 */
router.post(
  '/',
  verifyToken,
  isCitizen,
  applicationUploadController.uploadFiles,
  applicationUploadController.submitApplication
);

/**
 * @route GET /api/application-upload/test-schema
 * @desc Test database schema
 * @access Public
 */
router.get('/test-schema', applicationUploadController.testDatabaseSchema);

module.exports = router; 