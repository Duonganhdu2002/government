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
        return sendError(res, "All fields (Full Name, Identification Number, Address, Phone Number, Email, Username, Password, and Area Code) are required.", 400);
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
        logger.warn('Missing registration fields:', missingFields);
      }

      // Check if a user already exists with the same username, identification number, email, or phone number
      const userCheck = await pool.query(
        "SELECT * FROM citizens WHERE username = $1 OR identificationnumber = $2 OR email = $3 OR phonenumber = $4",
        [username, identificationnumber, email, phonenumber]
      );
      if (userCheck.rows.length > 0) {
        // Find which specific field is duplicated
        const duplicateRecord = userCheck.rows[0];
        let duplicateField = [];
        
        if (duplicateRecord.username === username) duplicateField.push('username');
        if (duplicateRecord.identificationnumber === identificationnumber) duplicateField.push('identification number');
        if (duplicateRecord.email === email) duplicateField.push('email');
        if (duplicateRecord.phonenumber === phonenumber) duplicateField.push('phone number');
        
        const errorMessage = `The following field(s) already exist: ${duplicateField.join(', ')}`;
        return sendError(res, errorMessage, 400);
      }

      // Hash the user's password using bcrypt
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Set default profile image path
      const defaultImagePath = '/default-avatar.png';

      // Insert the new user into the database
      const result = await pool.query(
        `INSERT INTO citizens 
          (fullname, identificationnumber, address, phonenumber, email, username, passwordhash, areacode, imagelink)
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        [
          fullname,
          identificationnumber,
          address,
          phonenumber,
          email,
          username,
          passwordHash,
          areaCodeNum,
          defaultImagePath
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
      return sendSuccess(res, {
        message: "User registered successfully.",
        user: {
          id: user.citizenid,
          fullname: user.fullname,
          identificationnumber: user.identificationnumber,
          address: user.address,
          phonenumber: user.phonenumber,
          email: user.email,
          username: user.username,
          areacode: user.areacode,
          imagelink: user.imagelink
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 201);
    } catch (error) {
      logger.error("Error during registration:", error);
      
      // Provide more detailed error information for debugging
      if (error.code) {
        logger.error(`Database error code: ${error.code}`);
      }
      
      if (error.detail) {
        logger.error(`Error detail: ${error.detail}`);
      }
      
      // Handle specific error cases
      if (error.code === '23505') {
        // Unique violation
        return sendError(res, "Duplicate information detected. Please check your identification number, email, phone number, or username.", 400);
      }
      
      if (error.code === '23502') {
        // Not null violation
        return sendError(res, "Missing required information. Please complete all required fields.", 400);
      }
      
      if (error.code === '23503') {
        // Foreign key violation
        return sendError(res, "Invalid area code. Please select a valid area.", 400);
      }
      
      return sendError(res, "Failed to register user. Please try again or contact support.", 500);
    }
  },

  /**
   * Registers a new staff member.
   * Expects request body to include:
   *   - agencyid (number): Agency ID
   *   - fullname (string): Full Name
   *   - role (string): Staff role (default: 'staff')
   *   - password (string): Plain text password
   *
   * All fields are mandatory. If any field is missing, registration fails.
   */
  registerStaff: async (req, res) => {
    try {
      let { agencyid, fullname, role = 'staff', password } = req.body;
      
      // Validate role is either 'staff' or 'admin'
      if (role !== 'staff' && role !== 'admin') {
        role = 'staff'; // Default to staff if invalid role
      }
      
      // Convert agencyid to a number if it's a string
      if (typeof agencyid === 'string') {
        agencyid = parseInt(agencyid, 10);
      }
      
      // Validate that all required fields are provided
      if (!agencyid) {
        return sendError(res, "Vui lòng nhập mã cơ quan.", 400);
      }
      
      if (!fullname) {
        return sendError(res, "Vui lòng nhập họ và tên.", 400);
      }
      
      if (!password) {
        return sendError(res, "Vui lòng nhập mật khẩu.", 400);
      }
      
      // Validate password length
      if (password.length < 6) {
        return sendError(res, "Mật khẩu phải có ít nhất 6 ký tự.", 400);
      }
      
      // Try to check if agency exists - skip if the query fails
      try {
        const agencyCheck = await executeQuery(
          'SELECT agencyid FROM agency WHERE agencyid = $1',
          [agencyid]
        );
        
        if (agencyCheck.rows.length === 0) {
          return sendError(res, "Mã cơ quan không tồn tại.", 400);
        }
      } catch (agencyErr) {
        // Log the error but continue with registration
        logger.warn('Error checking agency existence:', agencyErr);
        // We'll continue and let the foreign key constraint handle this if necessary
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordhash = await bcrypt.hash(password, salt);
      
      // Insert new staff into database
      try {
        const result = await executeQuery(
          `INSERT INTO staff (agencyid, fullname, role, passwordhash) 
           VALUES ($1, $2, $3, $4) 
           RETURNING staffid, agencyid, fullname, role`,
          [agencyid, fullname, role, passwordhash]
        );
        
        if (result.rows.length === 0) {
          throw new Error("Failed to create staff account.");
        }
        
        // Generate tokens for the new staff member
        const staffUser = result.rows[0];
        
        const accessToken = authUtil.generateToken(
          {
            id: staffUser.staffid,
            role: staffUser.role,
            type: 'staff'
          },
          ACCESS_TOKEN_SECRET,
          ACCESS_TOKEN_EXPIRY
        );
        
        const refreshToken = authUtil.generateToken(
          {
            id: staffUser.staffid,
            type: 'staff'
          },
          REFRESH_TOKEN_SECRET,
          REFRESH_TOKEN_EXPIRY
        );
        
        // Store refresh token
        await authUtil.storeTokenInDatabase(staffUser.staffid, refreshToken, 'staff');
        
        // Return success with user and tokens
        logger.info('Staff registered successfully', { userId: staffUser.staffid });
        
        return sendSuccess(res, {
          user: {
            id: staffUser.staffid,
            type: 'staff',
            role: staffUser.role,
            agencyId: staffUser.agencyid,
            name: staffUser.fullname
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: ACCESS_TOKEN_EXPIRY
          }
        }, 201);
      } catch (dbError) {
        // Handle database error
        logger.error('Database error during staff insertion:', dbError);
        
        if (dbError.code === '23505') {
          // Unique violation
          return sendError(res, "Tài khoản đã tồn tại.", 409);
        } else if (dbError.code === '23502') {
          // Not null violation
          return sendError(res, "Vui lòng điền đầy đủ thông tin.", 400);
        } else if (dbError.code === '23503') {
          // Foreign key violation
          return sendError(res, "Mã cơ quan không hợp lệ.", 400);
        } else {
          // Other database error
          return sendError(res, "Lỗi cơ sở dữ liệu: " + (dbError.message || "Không xác định"), 500);
        }
      }
    } catch (error) {
      logger.error('Staff registration error:', error);
      return sendError(res, "Đăng ký thất bại. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.", 500);
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
      
      // Query user - Lấy đầy đủ thông tin nhưng không lấy passwordhash
      let query;
      
      if (userType === 'staff') {
        query = `
          SELECT 
            staffid, username, passwordhash, role, agencyid, 
            fullname, email, phonenumber 
          FROM staff 
          WHERE username = $1;
        `;
      } else {
        query = `
          SELECT 
            citizenid, username, passwordhash, fullname, 
            identificationnumber, address, phonenumber, 
            email, areacode, imagelink
          FROM citizens 
          WHERE username = $1;
        `;
      }
      
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
      let userData;
      
      if (userType === 'staff') {
        userData = {
          id: user.staffid,
          username: user.username,
          type: userType,
          role: user.role,
          agencyId: user.agencyid,
          name: user.fullname,
          email: user.email,
          phoneNumber: user.phonenumber
        };
      } else {
        userData = {
          id: user.citizenid,
          username: user.username,
          type: userType,
          name: user.fullname,
          identificationNumber: user.identificationnumber,
          address: user.address,
          phoneNumber: user.phonenumber,
          email: user.email,
          areaCode: user.areacode,
          imageLink: user.imagelink
        };
      }
      
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
   * Logs in a staff member using username or employee code
   * Expects request body to include:
   *   - username (string): Username OR
   *   - employeeCode (string): Employee Code
   *   - password (string): Plain text password
   *
   * If the credentials are valid, returns new access and refresh tokens.
   */
  loginStaff: async (req, res, next) => {
    let { username, employeeCode, password } = req.body;
    
    // Validate request
    if ((!username && !employeeCode) || !password) {
      return sendError(res, 'Username/Employee Code and password are required', 400);
    }
    
    try {
      // Query user based on username or employee code
      let query;
      let queryParams = [];
      
      if (employeeCode) {
        query = `
          SELECT 
            staffid, username, passwordhash, role, agencyid, 
            fullname, email, phonenumber, employeecode
          FROM staff 
          WHERE employeecode = $1;
        `;
        queryParams = [employeeCode];
      } else {
        query = `
          SELECT 
            staffid, username, passwordhash, role, agencyid, 
            fullname, email, phonenumber, employeecode
          FROM staff 
          WHERE username = $1;
        `;
        queryParams = [username];
      }
      
      const result = await executeQuery(query, queryParams);
      
      if (result.rows.length === 0) {
        const errorDetail = employeeCode 
          ? 'Login attempt with invalid employee code' 
          : 'Login attempt with invalid username';
        
        logger.warn(errorDetail, { 
          username, 
          employeeCode
        });
        
        return sendError(res, 'Invalid credentials', 401);
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isPasswordValid = await authUtil.comparePassword(password, user.passwordhash);
      
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { 
          username: user.username,
          employeeCode: user.employeecode
        });
        
        return sendError(res, 'Invalid credentials', 401);
      }
      
      // Generate tokens
      const accessToken = authUtil.generateToken(
        {
          id: user.staffid,
          role: user.role,
          type: 'staff'
        }, 
        ACCESS_TOKEN_SECRET, 
        ACCESS_TOKEN_EXPIRY
      );
      
      const refreshToken = authUtil.generateToken(
        {
          id: user.staffid,
          type: 'staff'
        }, 
        REFRESH_TOKEN_SECRET, 
        REFRESH_TOKEN_EXPIRY
      );
      
      // Save refresh token to database
      await authUtil.storeTokenInDatabase(user.staffid, refreshToken, 'staff');
      
      // User data to return (excluding password)
      const userData = {
        id: user.staffid,
        username: user.username,
        type: 'staff',
        role: user.role,
        agencyId: user.agencyid,
        name: user.fullname,
        email: user.email,
        phoneNumber: user.phonenumber,
        employeeCode: user.employeecode
      };
      
      logger.info('Staff logged in successfully', { userId: user.staffid });
      
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
      logger.error('Staff login error:', { error: error.message, username, employeeCode });
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
   * Thay đổi mật khẩu cho tài khoản staff.
   * Yêu cầu cung cấp staffId, mật khẩu cũ và mật khẩu mới.
   * Sau khi đổi mật khẩu thành công, sẽ xóa refresh token hiện tại,
   * buộc người dùng đăng nhập lại.
   */
  staffChangePassword: async (req, res) => {
    try {
      const { staffId, oldPassword, newPassword } = req.body;

      // Validate input: staffId, oldPassword, and newPassword must be provided
      if (!staffId || !oldPassword || !newPassword) {
        return res.status(400).json({
          error: "Staff ID, old password, and new password are required.",
        });
      }

      // Fetch the staff user from the database using the staffId
      const result = await pool.query(
        "SELECT * FROM staff WHERE staffid = $1",
        [staffId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Staff user not found." });
      }
      const staff = result.rows[0];

      // Verify that the provided old password matches the stored password hash
      const passwordMatch = await bcrypt.compare(
        oldPassword,
        staff.passwordhash
      );
      if (!passwordMatch) {
        return res.status(400).json({ error: "Old password is incorrect." });
      }

      // Optionally check the strength of the new password (e.g., minimum 6 characters)
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "New password must be at least 6 characters long.",
        });
      }

      // Hash the new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update the password in the database
      await pool.query(
        "UPDATE staff SET passwordhash = $1 WHERE staffid = $2",
        [newPasswordHash, staffId]
      );

      // Remove the current refresh token to force re-login
      await redisClient.del(`staffRefreshToken_${staffId}`);

      res.status(200).json({
        message: "Password changed successfully. Please log in again.",
      });
    } catch (error) {
      console.error("Error changing staff password:", error);
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
          error: 'User not authenticated'
        });
      }
      
      console.log('Fetching user profile for ID:', userId);
      
      try {
        // First, check if database connection is working with a simple query
        try {
          const connectionTest = await executeQuery('SELECT 1 AS connection_test');
          console.log('Database connection test successful:', connectionTest?.rows?.[0]);
        } catch (connErr) {
          console.error('Database connection test failed:', connErr);
          return res.status(503).json({
            error: 'Database service unavailable',
            details: process.env.NODE_ENV === 'development' ? connErr.message : 'Unable to connect to database'
          });
        }
        
        // Try to find user in citizens table
        let result;
        try {
          result = await executeQuery(
            'SELECT citizenid, fullname, username, email, identificationnumber, phonenumber, address, areacode FROM citizens WHERE citizenid = $1',
            [userId]
          );
        } catch (citizenErr) {
          console.error('Error querying citizens table:', citizenErr);
          
          // Try to find user in staff table instead of failing immediately
          try {
            result = await executeQuery(
              'SELECT staffid, fullname, username, email, role, agencyid FROM staff WHERE staffid = $1',
              [userId]
            );
          } catch (staffErr) {
            console.error('Error querying staff table:', staffErr);
            throw new Error('Failed to query both citizens and staff tables: ' + citizenErr.message);
          }
        }
        
        if (result?.rows && result.rows.length > 0) {
          // Check if this is a citizen (has citizenid) or staff (has staffid)
          const user = result.rows[0];
          
          if (user.citizenid) {
            // Là công dân
            return res.status(200).json({
              id: user.citizenid, 
              fullname: user.fullname,
              username: user.username,
              email: user.email,
              identificationnumber: user.identificationnumber,
              phonenumber: user.phonenumber,
              address: user.address,
              areacode: user.areacode,
              imagelink: null,
              type: 'citizen'
            });
          } else {
            // Là nhân viên
            return res.status(200).json({
              id: user.staffid,
              fullname: user.fullname,
              username: user.username,
              email: user.email,
              role: user.role,
              agencyid: user.agencyid,
              type: 'staff'
            });
          }
        }
        
        // Không tìm thấy người dùng
        return res.status(404).json({
          error: 'User not found'
        });
      } catch (dbError) {
        // Handle database error specifically
        console.error('Database error in getCurrentUser:', dbError);
        
        // Provide more detailed error information
        const errorResponse = {
          error: 'Database error when fetching user profile',
          message: dbError.message
        };
        
        // Add query details in development mode
        if (process.env.NODE_ENV === 'development') {
          errorResponse.details = {
            message: dbError.message,
            query: dbError.query,
            code: dbError.code
          };
        }
        
        return res.status(500).json(errorResponse);
      }
    } catch (error) {
      console.error('General error in getCurrentUser:', error);
      return res.status(500).json({
        error: 'Internal server error when fetching user profile',
        message: error.message
      });
    }
  },

  /**
   * Logs in a staff member using staff ID
   * Expects request body to include:
   *   - staffId (number): Staff ID
   *   - password (string): Plain text password
   *
   * If the credentials are valid, returns new access and refresh tokens.
   */
  loginStaffById: async (req, res, next) => {
    let { staffId, password } = req.body;
    
    // Validate request
    if (!staffId || !password) {
      return sendError(res, 'Vui lòng nhập ID nhân viên và mật khẩu', 400);
    }
    
    try {
      // Query user based on staffId
      const query = `
        SELECT 
          staffid, passwordhash, role, agencyid, fullname
        FROM staff 
        WHERE staffid = $1;
      `;
      const queryParams = [staffId];
      
      const result = await executeQuery(query, queryParams);
      
      if (result.rows.length === 0) {
        logger.warn('Login attempt with invalid staff ID', { staffId });
        return sendError(res, 'ID nhân viên hoặc mật khẩu không đúng', 401);
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isPasswordValid = await authUtil.comparePassword(password, user.passwordhash);
      
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { staffId: user.staffid });
        return sendError(res, 'ID nhân viên hoặc mật khẩu không đúng', 401);
      }
      
      // Generate tokens
      const accessToken = authUtil.generateToken(
        {
          id: user.staffid,
          role: user.role,
          type: 'staff'
        }, 
        ACCESS_TOKEN_SECRET, 
        ACCESS_TOKEN_EXPIRY
      );
      
      const refreshToken = authUtil.generateToken(
        {
          id: user.staffid,
          type: 'staff'
        }, 
        REFRESH_TOKEN_SECRET, 
        REFRESH_TOKEN_EXPIRY
      );
      
      // Save refresh token to database
      await authUtil.storeTokenInDatabase(user.staffid, refreshToken, 'staff');
      
      // User data to return (excluding password)
      const userData = {
        id: user.staffid,
        type: 'staff',
        role: user.role,
        agencyId: user.agencyid,
        name: user.fullname
      };
      
      logger.info('Staff logged in successfully', { userId: user.staffid });
      
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
      logger.error('Staff login error:', { error: error.message, staffId });
      return sendError(res, 'Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'), 500);
    }
  },

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
