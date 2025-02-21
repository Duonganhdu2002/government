// routes/applicationsRoutes.js
const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');

// GET all applications
router.get('/', applicationsController.getAllApplications);

// GET application by ID
router.get('/:id', applicationsController.getApplicationById);

// CREATE a new application
router.post('/', applicationsController.createApplication);

// UPDATE an existing application
router.put('/:id', applicationsController.updateApplication);

// DELETE an application
router.delete('/:id', applicationsController.deleteApplication);

module.exports = router;
