// routes/applicationTypesRoutes.js
const express = require('express');
const router = express.Router();
const applicationTypesController = require('../controllers/applicationTypesController');

// GET all application types
router.get('/', applicationTypesController.getAllApplicationTypes);

// GET application type by ID
router.get('/:id', applicationTypesController.getApplicationTypeById);

// CREATE a new application type
router.post('/', applicationTypesController.createApplicationType);

// UPDATE an existing application type
router.put('/:id', applicationTypesController.updateApplicationType);

// DELETE an application type
router.delete('/:id', applicationTypesController.deleteApplicationType);

module.exports = router;
