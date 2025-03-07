// routes/mediaPostFilesRoutes.js
const express = require('express');
const router = express.Router();
const mediaPostFilesController = require('../controllers/mediaPostFilesController');
const { verifyToken } = require('../middleware/auth.middleware');

// GET all media post files
router.get('/', mediaPostFilesController.getAllMediaPostFiles);

// GET media post file by ID
router.get('/:id', mediaPostFilesController.getMediaPostFileById);

// GET media files by post ID
router.get('/by-post/:postId', mediaPostFilesController.getMediaFilesByPostId);

// UPLOAD files for a post (admin or agency staff only)
router.post('/upload', verifyToken, mediaPostFilesController.uploadPostFiles);

// DELETE a media post file (admin or agency staff only)
router.delete('/:id', verifyToken, mediaPostFilesController.deleteMediaPostFile);

module.exports = router; 