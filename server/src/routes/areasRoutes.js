// routes/areasRoutes.js
const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areasController');

// GET all areas
router.get('/', areasController.getAllAreas);

// GET area by ID
router.get('/:id', areasController.getAreaById);

// CREATE a new area
router.post('/', areasController.createArea);

// UPDATE an existing area
router.put('/:id', areasController.updateArea);

// DELETE an area
router.delete('/:id', areasController.deleteArea);

module.exports = router;
