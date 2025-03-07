/**
 * auth.middleware.js
 * 
 * Authentication middleware functions for the application
 * Provides JWT verification and role-based access control functions
 */

const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/**
 * Middleware to verify JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'Not provided');
    
    if (!authHeader) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No authorization header provided' 
      });
    }

    const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
    console.log('Token extracted:', token ? `${token.substring(0, 10)}...` : 'Not available');
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No token provided' 
      });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ 
          status: 'error',
          message: 'Invalid or expired token' 
        });
      }
      
      console.log('Token decoded successfully, user ID:', decoded.id);
      // Attach userId from token to request
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to verify user is staff
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const isStaff = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM staff WHERE staffid = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not staff' 
      });
    }

    // Attach the role to req for potential use in controllers
    req.userRole = result.rows[0].role;
    next();
  } catch (error) {
    console.error('Error in isStaff middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to verify user is an admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const isAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM staff WHERE staffid = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not staff' 
      });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not an admin' 
      });
    }

    req.userRole = 'admin';
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to verify user is a citizen
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const isCitizen = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT citizenid FROM citizens WHERE citizenid = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not a citizen' 
      });
    }

    next();
  } catch (error) {
    console.error('Error in isCitizen middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  verifyToken,
  isStaff,
  isAdmin,
  isCitizen
}; 