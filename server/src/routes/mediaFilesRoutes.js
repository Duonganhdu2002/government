/**
 * routes/mediaFilesRoutes.js
 *
 * Định nghĩa các endpoint cho quản lý file media.
 * Các route này cho phép lấy danh sách, lấy chi tiết theo ID, tạo mới,
 * cập nhật và xóa một bản ghi file media.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mediaFilesController = require('../controllers/mediaFilesController');

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Thư mục tạm, sẽ di chuyển file sau khi xử lý
    cb(null, path.join(process.cwd(), 'public/uploads'));
  },
  filename: function(req, file, cb) {
    // Tạo tên file duy nhất
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  },
  fileFilter: function(req, file, cb) {
    // Chấp nhận tất cả các loại file phổ biến
    const allowedMimeTypes = [
      'image/', 'video/', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];

    // Kiểm tra xem MIME type có được chấp nhận không
    const isAllowed = allowedMimeTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Loại file không được hỗ trợ'), false);
    }
  }
});

// Lấy danh sách tất cả các file media
router.get('/', mediaFilesController.getAllMediaFiles);

// Lấy danh sách file media theo application ID
router.get('/by-application/:applicationId', mediaFilesController.getMediaFilesByApplicationId);

// Check if a file exists
router.get('/check', mediaFilesController.checkMediaFileExists);

// Truy cập trực tiếp nội dung file media theo ID
router.get('/serve/:id', mediaFilesController.serveMediaFile);

// Upload ảnh đại diện người dùng
router.post('/profile-image', upload.single('image'), mediaFilesController.uploadProfileImage);

// Lấy thông tin chi tiết của file media theo ID
router.get('/:id', mediaFilesController.getMediaFileById);

// Tạo mới một bản ghi file media
router.post('/', mediaFilesController.createMediaFile);

// Cập nhật thông tin của file media theo ID
router.put('/:id', mediaFilesController.updateMediaFile);

// Xóa file media theo ID
router.delete('/:id', mediaFilesController.deleteMediaFile);

// Upload file media (yêu cầu xác thực)
router.post('/', mediaFilesController.uploadFiles);

module.exports = router;
