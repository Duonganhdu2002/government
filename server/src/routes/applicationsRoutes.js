// routes/applicationsRoutes.js
const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { verifyToken, isCitizen } = require('../middleware/auth.middleware');

// Public routes
// GET all applications
router.get('/', applicationsController.getAllApplications);

// GET application statistics
router.get('/stats/summary', applicationsController.getApplicationStatistics);

// Protected routes (require authentication)
// GET applications for current user
router.get('/current-user', verifyToken, isCitizen, applicationsController.getCurrentUserApplications);

// GET applications by citizen ID
router.get('/citizen/:citizenId', applicationsController.getApplicationsByCitizenId);

// GET application by ID
router.get('/:id', applicationsController.getApplicationById);

// CREATE a new application
router.post('/', verifyToken, applicationsController.createApplication);

// UPDATE an existing application
router.put('/:id', verifyToken, applicationsController.updateApplication);

// DELETE an application
router.delete('/:id', verifyToken, applicationsController.deleteApplication);

module.exports = router;
