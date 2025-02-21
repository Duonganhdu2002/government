// routes/processingHistoryRoutes.js
const express = require('express');
const router = express.Router();
const processingHistoryController = require('../controllers/processingHistoryController');

// GET all processing history records
router.get('/', processingHistoryController.getAllProcessingHistory);

// GET a processing history record by ID
router.get('/:id', processingHistoryController.getProcessingHistoryById);

// CREATE a new processing history record
router.post('/', processingHistoryController.createProcessingHistory);

// UPDATE a processing history record
router.put('/:id', processingHistoryController.updateProcessingHistory);

// DELETE a processing history record
router.delete('/:id', processingHistoryController.deleteProcessingHistory);

module.exports = router;
