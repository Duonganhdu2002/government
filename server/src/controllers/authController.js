/**
 * controllers/authController.js
 *
 * This module handles user authentication including registration,
 * login, token refreshing, and logout. It requires all mandatory fields
 * during registration to ensure data integrity.
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database"); // PostgreSQL connection pool
const redisClient = require("../config/redis"); // Redis client for refresh tokens
const { executeQuery } = require('../utils/db.util');
const { sendSuccess, sendError } = require('../utils/response.util');
const { createError } = require('../middleware/error.middleware');
const logger = require('../utils/logger.util');
const authUtil = require('../utils/auth.util');

// Load environment variables for JWT secrets and token expiry settings
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = authUtil.constants;

/**
 * Generates a JWT access token.
 * @param {Object} user - User object containing at least id and username.
 * @returns {string} - Signed JWT access token.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.citizenid || user.staffid, username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generates a JWT refresh token.
 * @param {Object} user - User object containing at least id and username.
 * @returns {string} - Signed JWT refresh token.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.citizenid || user.staffid, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

const authController = {
  /**
   * Registers a new user.
   * Expects request body to include:
   *   - fullname (string): Full Name
   *   - identificationnumber (string): Identification Number
   *   - address (string): Address
   *   - phonenumber (string): Phone Number
   - email (string): Email Address
   *   - username (string): Username
   *   - password (string): Plain text password
   *   - areacode (number): Area Code
   *
   * All fields are mandatory. If any field is missing, registration fails.
   */
  register: async (req, res) => {
    try {
      const {
        fullname,
        identificationnumber,
        address,
        phonenumber,
        email,
        username,
        password,
        areacode,
      } = req.body;

      // Ensure areacode is a number
      const areaCodeNum = parseInt(areacode, 10);
      
      // Validate that all required fields are provided
      if (
        !fullname ||
        !identificationnumber ||
        !address ||
        !phonenumber ||
        !email ||
        !username ||
        !password ||
        !areaCodeNum
      ) {
        return res.status(400).json({
          error:
            "All fields (Full Name, Identification Number, Address, Phone Number, Email, Username, Password, and Area Code) are required.",
        });
      }

      // Log which fields are missing for debugging
      const missingFields = [];
      if (!fullname) missingFields.push('fullname');
      if (!identificationnumber) missingFields.push('identificationnumber');
      if (!address) missingFields.push('address');
      if (!phonenumber) missingFields.push('phonenumber');
      if (!email) missingFields.push('email');
      if (!username) missingFields.push('username');
      if (!password) missingFields.push('password');
      if (!areaCodeNum) missingFields.push('areacode');
      
      if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields);
      }

      // Check if a user already exists with the same username, identification number, email, or phone number
      const userCheck = await pool.query(
        "SELECT * FROM Citizens WHERE Username = $1 OR IdentificationNumber = $2 OR Email = $3 OR PhoneNumber = $4",
        [username, identificationnumber, email, phonenumber]
      );
      if (userCheck.rows.length > 0) {
        // Find which specific field is duplicated
        const duplicateRecord = userCheck.rows[0];
        let duplicateField = [];
        
        if (duplicateRecord.Username === username) duplicateField.push('username');
        if (duplicateRecord.IdentificationNumber === identificationnumber) duplicateField.push('identification number');
        if (duplicateRecord.Email === email) duplicateField.push('email');
        if (duplicateRecord.PhoneNumber === phonenumber) duplicateField.push('phone number');
        
        const errorMessage = `The following field(s) already exist: ${duplicateField.join(', ')}`;
        return res.status(400).json({ error: errorMessage });
      }

      // Hash the user's password using bcrypt
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert the new user into the database
      const result = await pool.query(
        `INSERT INTO Citizens 
          (FullName, IdentificationNumber, Address, PhoneNumber, Email, Username, PasswordHash, AreaCode)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [
          fullname,
          identificationnumber,
          address,
          phonenumber,
          email,
          username,
          passwordHash,
          areaCodeNum,
        ]
      );
      const user = result.rows[0];

      // Generate JWT access and refresh tokens for the new user
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store the refresh token in Redis with an expiration time
      await redisClient.set(`refreshToken_${user.citizenid}`, refreshToken, {
        EX: REFRESH_TOKEN_EXPIRY,
      });

      // Respond with the created user details and tokens
      res.status(201).json({
        message: "User registered successfully.",
        user: {
          id: user.citizenid,
          fullname: user.FullName,
          identificationnumber: user.IdentificationNumber,
          address: user.Address,
          phonenumber: user.PhoneNumber,
          email: user.Email,
          username: user.Username,
          areacode: user.AreaCode,
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error("Error during registration:", error);
      
      // Provide more detailed error information for debugging
      if (error.code) {
        console.error(`Database error code: ${error.code}`);
      }
      
      if (error.detail) {
        console.error(`Error detail: ${error.detail}`);
      }
      
      if (error.constraint) {
        console.error(`Constraint violation: ${error.constraint}`);
      }
      
      if (error.stack) {
        console.error(`Stack trace: ${error.stack}`);
      }
      
      // Handle specific error cases
      if (error.code === '23505') {
        // Unique violation
        return res.status(400).json({ 
          error: "Duplicate information detected. Please check your identification number, email, phone number, or username."
        });
      }
      
      if (error.code === '23502') {
        // Not null violation
        return res.status(400).json({ 
          error: "Missing required information. Please complete all required fields."
        });
      }
      
      if (error.code === '23503') {
        // Foreign key violation
        return res.status(400).json({ 
          error: "Invalid area code. Please select a valid area."
        });
      }
      
      res.status(500).json({ error: "Failed to register user. Please try again or contact support." });
    }
  },

  /**
   * Logs in an existing user.
   * Expects request body to include:
   *   - username (string): Username
   *   - password (string): Plain text password
   *
   * If the credentials are valid, returns new access and refresh tokens.
   */
  login: async (req, res, next) => {
    let { username, password, userType } = req.body;
    
    // Normalize userType from potential object to string
    if (typeof userType === 'object' && userType !== null) {
      userType = userType.toString();
    }
    
    // Validate request
    if (!username || !password) {
      return sendError(res, 'Username and password are required', 400);
    }
    
    if (!['staff', 'citizen'].includes(userType)) {
      return sendError(res, 'Invalid user type', 400);
    }
    
    try {
      // Different tables based on user type
      const table = userType === 'staff' ? 'staff' : 'citizens';
      const idField = userType === 'staff' ? 'staffid' : 'citizenid';
      
      // Query user
      const query = `
        SELECT ${idField}, username, passwordhash, 
        ${userType === 'staff' ? 'role, agencyid' : 'fullname, areacode'} 
        FROM ${table} 
        WHERE username = $1;
      `;
      
      const result = await executeQuery(query, [username]);
      
      if (result.rows.length === 0) {
        logger.warn('Login attempt with invalid username', { username, userType });
        return sendError(res, 'Invalid credentials', 401);
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isPasswordValid = await authUtil.comparePassword(password, user.passwordhash);
      
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { username, userType });
        return sendError(res, 'Invalid credentials', 401);
      }
      
      // Generate tokens
      const accessToken = authUtil.generateToken(
        {
          id: user[idField],
          role: userType === 'staff' ? user.role : 'citizen',
          type: userType
        }, 
        ACCESS_TOKEN_SECRET, 
        ACCESS_TOKEN_EXPIRY
      );
      
      const refreshToken = authUtil.generateToken(
        {
          id: user[idField],
          type: userType
        }, 
        REFRESH_TOKEN_SECRET, 
        REFRESH_TOKEN_EXPIRY
      );
      
      // Save refresh token to database
      await authUtil.storeTokenInDatabase(user[idField], refreshToken, userType);
      
      // User data to return (excluding password)
      const userData = {
        id: user[idField],
        username: user.username,
        type: userType,
        ...(userType === 'staff' 
          ? { role: user.role, agencyId: user.agencyid } 
          : { name: user.fullname, areaCode: user.areacode })
      };
      
      logger.info('User logged in successfully', { userId: user[idField], userType });
      
      // Send response
      return sendSuccess(res, {
        user: userData,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: ACCESS_TOKEN_EXPIRY
        }
      });
    } catch (error) {
      logger.error('Login error:', { error: error.message, username, userType });
      return sendError(res, 'Authentication failed: ' + (error.message || 'Unknown error'), 500);
    }
  },

  /**
   * Refreshes the JWT access token using a valid refresh token.
   * Expects request body to include:
   *   - refreshToken (string): Valid refresh token
   *
   * Returns a new access token if the refresh token is valid.
   */
  refreshToken: async (req, res, next) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }
    
    try {
      // Verify the refresh token but don't check if expired
      const decoded = jwt.decode(refreshToken);
      
      if (!decoded || !decoded.id || !decoded.type) {
        logger.warn('Invalid refresh token format', { token: refreshToken });
        return sendError(res, 'Invalid refresh token', 401);
      }
      
      // Check if token is valid in database
      const isValid = await authUtil.validateTokenInDatabase(
        decoded.id, 
        refreshToken, 
        decoded.type
      );
      
      if (!isValid) {
        logger.warn('Invalid or expired refresh token', { 
          userId: decoded.id, 
          userType: decoded.type 
        });
        return sendError(res, 'Invalid or expired refresh token', 401);
      }
      
      // Get user info to include in new token
      const userTable = decoded.type === 'staff' ? 'staff' : 'citizens';
      const idField = decoded.type === 'staff' ? 'staffid' : 'citizenid';
      const userQuery = `
        SELECT ${idField}, ${decoded.type === 'staff' ? 'role' : 'fullname'}
        FROM ${userTable}
        WHERE ${idField} = $1;
      `;
      
      const userResult = await executeQuery(userQuery, [decoded.id]);
      
      if (userResult.rows.length === 0) {
        logger.warn('User not found during token refresh', { 
          userId: decoded.id, 
          userType: decoded.type 
        });
        return sendError(res, 'User not found', 404);
      }
      
      const user = userResult.rows[0];
      
      // Generate new access token
      const accessToken = authUtil.generateToken(
        {
          id: user[idField],
          role: decoded.type === 'staff' ? user.role : 'citizen',
          type: decoded.type
        },
        ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRY
      );
      
      // Generate new refresh token (token rotation for security)
      const newRefreshToken = authUtil.generateToken(
        {
          id: user[idField],
          type: decoded.type
        },
        REFRESH_TOKEN_SECRET,
        REFRESH_TOKEN_EXPIRY
      );
      
      // Update refresh token in database
      await authUtil.storeTokenInDatabase(
        decoded.id, 
        newRefreshToken, 
        decoded.type
      );
      
      logger.info('Token refreshed successfully', { 
        userId: decoded.id, 
        userType: decoded.type 
      });
      
      // Send response
      return sendSuccess(res, {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: ACCESS_TOKEN_EXPIRY
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', { error: error.message });
      next(createError('Token refresh failed', 500));
    }
  },

  /**
   * Logs out a user by invalidating the refresh token.
   * Expects request body to include:
   *   - userId (number): User's unique identifier
   *
   * Removes the refresh token from Redis.
   */
  logout: async (req, res, next) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }
    
    try {
      // Verify and decode the refresh token without checking expiry
      const decoded = jwt.decode(refreshToken);
      
      if (!decoded || !decoded.id || !decoded.type) {
        return sendError(res, 'Invalid refresh token format', 400);
      }
      
      // Delete the refresh token from database
      const success = await authUtil.removeTokenFromDatabase(
        decoded.id, 
        refreshToken, 
        decoded.type
      );
      
      if (success) {
        logger.info('User logged out successfully', { 
          userId: decoded.id, 
          userType: decoded.type 
        });
      } else {
        logger.warn('Token not found during logout', { 
          userId: decoded.id, 
          userType: decoded.type 
        });
      }
      
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      logger.error('Logout error:', { error: error.message });
      next(createError('Logout failed', 500));
    }
  },

  /**
   * Changes the user's password.
   * Expects the request body to include:
   *   - oldPassword (string): The current password.
   *   - newPassword (string): The new password.
   *
   * After updating the password, the current refresh token is removed,
   * forcing the user to log in again.
   */
  changePassword: async (req, res) => {
    try {
      const { citizenid, oldPassword, newPassword } = req.body;

      // Validate input: citizenid, oldPassword, and newPassword must be provided
      if (!citizenid || !oldPassword || !newPassword) {
        return res.status(400).json({
          error: "Citizen ID, old password, and new password are required.",
        });
      }

      // Fetch the user from the database using the citizenid
      const result = await pool.query(
        "SELECT * FROM citizens WHERE citizenid = $1",
        [citizenid]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }
      const user = result.rows[0];

      // Verify that the provided old password matches the stored password hash
      const passwordMatch = await bcrypt.compare(
        oldPassword,
        user.passwordhash
      );
      if (!passwordMatch) {
        return res.status(400).json({ error: "Old password is incorrect." });
      }

      // Optionally check the strength of the new password (e.g., minimum 8 characters)
      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "New password must be at least 8 characters long.",
        });
      }

      // Hash the new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update the password in the database
      await pool.query(
        "UPDATE citizens SET passwordhash = $1 WHERE citizenid = $2",
        [newPasswordHash, citizenid]
      );

      // Remove the current refresh token to force re-login
      await redisClient.del(`refreshToken_${citizenid}`);

      res.status(200).json({
        message: "Password changed successfully. Please log in again.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password." });
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại dựa trên token
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }
      
      // Thử tìm trong bảng citizens trước
      let result = await pool.query(
        'SELECT citizenid, fullname, username, email, identificationnumber, phonenumber, address, areacode FROM citizens WHERE citizenid = $1',
        [userId]
      );
      
      if (result.rows.length > 0) {
        // Là công dân
        const user = result.rows[0];
        return res.status(200).json({
          status: 'success',
          user: {
            ...user,
            type: 'citizen'
          }
        });
      }
      
      // Nếu không tìm thấy trong bảng citizens, thử tìm trong bảng staff
      result = await pool.query(
        'SELECT staffid, fullname, username, email, role, agencyid FROM staff WHERE staffid = $1',
        [userId]
      );
      
      if (result.rows.length > 0) {
        // Là nhân viên
        const user = result.rows[0];
        return res.status(200).json({
          status: 'success',
          user: {
            ...user,
            type: 'staff'
          }
        });
      }
      
      // Không tìm thấy người dùng
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      
    } catch (error) {
      console.error('Error getting current user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
};

/**
 * Store refresh token in database
 * 
 * @param {number} userId - User ID
 * @param {string} token - Refresh token
 * @param {string} userType - Type of user (staff or citizen)
 * @returns {Promise<void>}
 */
const storeRefreshToken = async (userId, token, userType) => {
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';
  
  // Delete any existing tokens for this user
  await executeQuery(`DELETE FROM ${table} WHERE ${idField} = $1;`, [userId]);
  
  // Insert new token
  await executeQuery(
    `INSERT INTO ${table} (${idField}, token, expiresat)
     VALUES ($1, $2, NOW() + interval '7 days');`,
    [userId, token]
  );
};

module.exports = authController;
