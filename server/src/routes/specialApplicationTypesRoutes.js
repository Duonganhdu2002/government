const express = require('express');
const router = express.Router();
const specialApplicationTypesController = require('../controllers/specialApplicationTypesController');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// GET all special application types
router.get('/', specialApplicationTypesController.getAllSpecialApplicationTypes);

// GET special application type by ID
router.get('/:id', specialApplicationTypesController.getSpecialApplicationTypeById);

// GET special application types by application type ID
router.get('/by-application-type/:applicationTypeId', specialApplicationTypesController.getSpecialApplicationTypesByAppTypeId);

// CREATE a new special application type (admin only)
router.post('/', verifyToken, isAdmin, specialApplicationTypesController.createSpecialApplicationType);

// UPDATE an existing special application type (admin only)
router.put('/:id', verifyToken, isAdmin, specialApplicationTypesController.updateSpecialApplicationType);

// DELETE a special application type (admin only)
router.delete('/:id', verifyToken, isAdmin, specialApplicationTypesController.deleteSpecialApplicationType);

module.exports = router; 