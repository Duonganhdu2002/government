// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// GET all staff members
router.get('/', staffController.getAllStaff);

// GET staff by ID
router.get('/:id', staffController.getStaffById);

// CREATE a new staff member
router.post('/', staffController.createStaff);

// UPDATE an existing staff member
router.put('/:id', staffController.updateStaff);

// DELETE a staff member
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
