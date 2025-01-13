const express = require('express');
const router = express.Router();
const citizensController = require('../controllers/citizensController');

router.get('/', citizensController.getAllUsers);
router.get('/:id', citizensController.getUserById);
router.post('/', citizensController.createUser);
router.put('/:id', citizensController.updateUser);
router.delete('/:id', citizensController.deleteUser);

module.exports = router;