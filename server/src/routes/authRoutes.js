/**
 * routes/authRoutes.js
 *
 * This file defines the Express routes for user authentication, including 
 * registration, login, token refreshing, and logout.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Log in an existing user
router.post('/login', authController.login);

// POST /api/auth/refresh - Refresh the access token using a refresh token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Log out the user and invalidate the refresh token
router.post('/logout', authController.logout);

// POST /api/auth/change-password - Change user's password (requires citizenid, oldPassword, and newPassword)
router.post('/change-password', authController.changePassword);


module.exports = router;
