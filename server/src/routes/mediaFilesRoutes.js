// routes/mediaFilesRoutes.js
const express = require('express');
const router = express.Router();
const mediaFilesController = require('../controllers/mediaFilesController');

// GET all media files
router.get('/', mediaFilesController.getAllMediaFiles);

// GET media file by ID
router.get('/:id', mediaFilesController.getMediaFileById);

// CREATE a new media file record
router.post('/', mediaFilesController.createMediaFile);

// UPDATE an existing media file record
router.put('/:id', mediaFilesController.updateMediaFile);

// DELETE a media file record
router.delete('/:id', mediaFilesController.deleteMediaFile);

module.exports = router;
