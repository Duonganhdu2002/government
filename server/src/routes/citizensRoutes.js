// routes/citizensRoutes.js
const express = require('express');
const router = express.Router();
const citizensController = require('../controllers/citizensController');

router.get('/', citizensController.getAllCitizens);
router.get('/:id', citizensController.getCitizenById);
router.post('/', citizensController.createCitizen);
router.put('/:id', citizensController.updateCitizen);
router.delete('/:id', citizensController.deleteCitizen);

module.exports = router;
