// routes/agencyDelaysRoutes.js
const express = require('express');
const router = express.Router();
const agencyDelaysController = require('../controllers/agencyDelaysController');

// GET all agency delays
router.get('/', agencyDelaysController.getAllAgencyDelays);

// GET agency delay by ID
router.get('/:id', agencyDelaysController.getAgencyDelayById);

// CREATE a new agency delay record
router.post('/', agencyDelaysController.createAgencyDelay);

// UPDATE an existing agency delay record
router.put('/:id', agencyDelaysController.updateAgencyDelay);

// DELETE an agency delay record
router.delete('/:id', agencyDelaysController.deleteAgencyDelay);

module.exports = router;
