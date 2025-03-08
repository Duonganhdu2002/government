/**
 * routes/applicationUploadRoutes.js
 *
 * Định nghĩa các endpoint liên quan đến việc upload file kèm theo đơn ứng dụng.
 * Bao gồm các route kiểm tra kết nối, kiểm tra schema và gửi đơn ứng dụng kèm file.
 */

const express = require('express');
const router = express.Router();
const applicationUploadController = require('../controllers/applicationUploadController');
const { verifyToken, isCitizen } = require('../middleware/auth.middleware');

/**
 * @route GET /api/application-upload/test
 * @desc Kiểm tra kết nối đến route upload
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
 * @desc Gửi đơn ứng dụng mới kèm theo file đính kèm
 * @access Private (chỉ dành cho người dân)
 */
router.post(
  '/',
  verifyToken,
  isCitizen,
  applicationUploadController.uploadFiles,     // Xử lý upload file
  applicationUploadController.submitApplication  // Gửi đơn ứng dụng
);

/**
 * @route GET /api/application-upload/test-schema
 * @desc Kiểm tra cấu trúc (schema) cơ sở dữ liệu
 * @access Public
 */
router.get('/test-schema', applicationUploadController.testDatabaseSchema);

module.exports = router;
