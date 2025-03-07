/**
 * auth.util.js
 * 
 * Authentication and authorization utility functions
 * Provides helper methods for managing tokens, permissions, and user authentication
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { executeQuery } = require('./db.util');
const logger = require('./logger.util');

// Default configurations
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Hash a password securely using bcrypt
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    logger.error('Error hashing password:', { error: error.message });
    throw new Error('Password hashing failed');
  }
};

/**
 * Compare a plain text password with a hash
 * 
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored password hash to compare against
 * @returns {Promise<boolean>} True if the password matches
 */
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing passwords:', { error: error.message });
    return false;
  }
};

/**
 * Generate a JWT access token
 * 
 * @param {Object} payload - Token payload data
 * @param {string} secret - Secret key for signing
 * @param {string} expiry - Token expiration period
 * @returns {string} Signed JWT token
 */
const generateToken = (payload, secret, expiry) => {
  try {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  } catch (error) {
    logger.error('Error generating token:', { error: error.message });
    throw new Error('Token generation failed');
  }
};

/**
 * Verify a JWT token
 * 
 * @param {string} token - Token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Token verification failed:', { error: error.message });
    return null;
  }
};

/**
 * Check if user has specified role
 * 
 * @param {Object} user - User object with role property
 * @param {string|Array} requiredRoles - Required role(s) for access
 * @returns {boolean} True if user has required role
 */
const hasRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;
  
  // Convert to array if single role provided
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return roles.includes(user.role);
};

/**
 * Store token in database for tracking
 * 
 * @param {number} userId - User ID
 * @param {string} token - Token to store
 * @param {string} userType - Type of user (staff or citizen)
 * @param {number} expiryDays - Days until token expires
 * @returns {Promise<void>}
 */
const storeTokenInDatabase = async (userId, token, userType, expiryDays = 7) => {
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';
  
  try {
    // Delete any existing tokens for this user
    await executeQuery(`DELETE FROM ${table} WHERE ${idField} = $1;`, [userId]);
    
    // Insert new token
    await executeQuery(
      `INSERT INTO ${table} (${idField}, token, expiresat)
       VALUES ($1, $2, NOW() + interval '${expiryDays} days');`,
      [userId, token]
    );
    
    logger.debug('Token stored in database', { userId, userType, expiryDays });
  } catch (error) {
    logger.error('Error storing token in database:', { 
      error: error.message, 
      userId, 
      userType 
    });
    throw error;
  }
};

/**
 * Validate token from database
 * 
 * @param {number} userId - User ID
 * @param {string} token - Token to validate
 * @param {string} userType - Type of user (staff or citizen)
 * @returns {Promise<boolean>} True if token is valid
 */
const validateTokenInDatabase = async (userId, token, userType) => {
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';
  
  try {
    const result = await executeQuery(
      `SELECT token FROM ${table} 
       WHERE ${idField} = $1 AND token = $2 AND expiresat > NOW();`,
      [userId, token]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Error validating token in database:', { 
      error: error.message, 
      userId, 
      userType 
    });
    return false;
  }
};

/**
 * Remove token from database (logout)
 * 
 * @param {number} userId - User ID
 * @param {string} token - Token to remove
 * @param {string} userType - Type of user (staff or citizen)
 * @returns {Promise<boolean>} True if token was removed
 */
const removeTokenFromDatabase = async (userId, token, userType) => {
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';
  
  try {
    const result = await executeQuery(
      `DELETE FROM ${table} WHERE ${idField} = $1 AND token = $2;`,
      [userId, token]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error removing token from database:', { 
      error: error.message, 
      userId, 
      userType 
    });
    return false;
  }
};

/**
 * Generate secure random string (for CSRF tokens, etc.)
 * 
 * @param {number} length - Length of string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  hasRole,
  storeTokenInDatabase,
  validateTokenInDatabase,
  removeTokenFromDatabase,
  generateRandomString,
  constants: {
    SALT_ROUNDS,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
  }
}; 