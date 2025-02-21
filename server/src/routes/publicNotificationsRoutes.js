// routes/publicNotificationsRoutes.js
const express = require('express');
const router = express.Router();
const publicNotificationsController = require('../controllers/publicNotificationsController');

// GET all public notifications
router.get('/', publicNotificationsController.getAllPublicNotifications);

// GET public notification by ID
router.get('/:id', publicNotificationsController.getPublicNotificationById);

// CREATE a new public notification
router.post('/', publicNotificationsController.createPublicNotification);

// UPDATE an existing public notification
router.put('/:id', publicNotificationsController.updatePublicNotification);

// DELETE a public notification
router.delete('/:id', publicNotificationsController.deletePublicNotification);

module.exports = router;
    