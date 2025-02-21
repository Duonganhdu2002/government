// routes/agenciesRoutes.js
const express = require('express');
const router = express.Router();
const agenciesController = require('../controllers/agenciesController');

// GET all agencies
router.get('/', agenciesController.getAllAgencies);

// GET agency by ID
router.get('/:id', agenciesController.getAgencyById);

// CREATE a new agency
router.post('/', agenciesController.createAgency);

// UPDATE an existing agency
router.put('/:id', agenciesController.updateAgency);

// DELETE an agency
router.delete('/:id', agenciesController.deleteAgency);

module.exports = router;
