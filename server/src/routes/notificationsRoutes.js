// routes/notificationsRoutes.js
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// GET all notifications
router.get('/', notificationsController.getAllNotifications);

// GET notification by ID
router.get('/:id', notificationsController.getNotificationById);

// CREATE a new notification
router.post('/', notificationsController.createNotification);

// UPDATE an existing notification
router.put('/:id', notificationsController.updateNotification);

// DELETE a notification
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
