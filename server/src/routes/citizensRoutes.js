// routes/citizensRoutes.js
const express = require('express');
const router = express.Router();
const citizensController = require('../controllers/citizensController');

// GET all citizens
router.get('/', citizensController.getAllCitizens);

// GET citizen by ID
router.get('/:id', citizensController.getCitizenById);

// CREATE a new citizen
router.post('/', citizensController.createCitizen);

// UPDATE an existing citizen
router.put('/:id', citizensController.updateCitizen);

// DELETE a citizen
router.delete('/:id', citizensController.deleteCitizen);

module.exports = router;
