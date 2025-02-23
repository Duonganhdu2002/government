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

// Load environment variables for JWT secrets and token expiry settings
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generates a JWT access token.
 * @param {Object} user - User object containing at least id and username.
 * @returns {string} - Signed JWT access token.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.citizenid, username: user.username },
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
    { id: user.citizenid, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS }
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
   *   - email (string): Email Address
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

      // Validate that all required fields are provided
      if (
        !fullname ||
        !identificationnumber ||
        !address ||
        !phonenumber ||
        !email ||
        !username ||
        !password ||
        !areacode
      ) {
        return res.status(400).json({
          error:
            "All fields (Full Name, Identification Number, Address, Phone Number, Email, Username, Password, and Area Code) are required.",
        });
      }

      // Check if a user already exists with the same username, identification number, email, or phone number
      const userCheck = await pool.query(
        "SELECT * FROM citizens WHERE username = $1 OR identificationnumber = $2 OR email = $3 OR phonenumber = $4",
        [username, identificationnumber, email, phonenumber]
      );
      if (userCheck.rows.length > 0) {
        return res.status(400).json({
          error:
            "Username, Identification Number, Email, or Phone Number already exists.",
        });
      }

      // Hash the user's password using bcrypt
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert the new user into the database (do not include citizenid so that it auto increments)
      const result = await pool.query(
        `INSERT INTO citizens (fullname, identificationnumber, address, phonenumber, email, username, passwordhash, areacode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [
          fullname,
          identificationnumber,
          address,
          phonenumber,
          email,
          username,
          passwordHash,
          areacode,
        ]
      );
      const user = result.rows[0];

      // Generate JWT access and refresh tokens for the new user
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store the refresh token in Redis with an expiration time
      await redisClient.set(`refreshToken_${user.citizenid}`, refreshToken, {
        EX: REFRESH_TOKEN_EXPIRY_SECONDS,
      });

      // Respond with the created user details and tokens
      res.status(201).json({
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
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Failed to register user." });
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
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required." });
      }

      // Retrieve the user record by username
      const result = await pool.query(
        "SELECT * FROM citizens WHERE username = $1",
        [username]
      );
      if (result.rows.length === 0) {
        return res.status(400).json({ error: "Invalid credentials." });
      }
      const user = result.rows[0];

      // Compare provided password with stored password hash
      const passwordMatch = await bcrypt.compare(password, user.passwordhash);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      // Generate new tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store the refresh token in Redis
      await redisClient.set(`refreshToken_${user.citizenid}`, refreshToken, {
        EX: REFRESH_TOKEN_EXPIRY_SECONDS,
      });

      // Return the user info and tokens
      res.status(200).json({
        message: "Logged in successfully.",
        user: {
          id: user.citizenid,
          fullname: user.fullname,
          identificationnumber: user.identificationnumber,
          address: user.address,
          phonenumber: user.phonenumber,
          email: user.email,
          username: user.username,
          areacode: user.areacode,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to log in." });
    }
  },

  /**
   * Refreshes the JWT access token using a valid refresh token.
   * Expects request body to include:
   *   - refreshToken (string): Valid refresh token
   *
   * Returns a new access token if the refresh token is valid.
   */
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required." });
      }

      // Verify the refresh token
      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: "Invalid refresh token." });
        }

        const userId = decoded.id;
        // Retrieve the stored refresh token from Redis
        const storedRefreshToken = await redisClient.get(
          `refreshToken_${userId}`
        );
        if (storedRefreshToken !== refreshToken) {
          return res.status(403).json({ error: "Refresh token mismatch." });
        }

        // Retrieve the user record from the database
        const result = await pool.query(
          "SELECT * FROM citizens WHERE citizenid = $1",
          [userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "User not found." });
        }
        const user = result.rows[0];

        // Generate a new access token
        const newAccessToken = generateAccessToken(user);
        res.status(200).json({ accessToken: newAccessToken });
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ error: "Failed to refresh token." });
    }
  },

  /**
   * Logs out a user by invalidating the refresh token.
   * Expects request body to include:
   *   - userId (number): User's unique identifier
   *
   * Removes the refresh token from Redis.
   */
  logout: async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res
          .status(400)
          .json({ error: "User ID is required for logout." });
      }

      // Remove the refresh token from Redis
      await redisClient.del(`refreshToken_${userId}`);
      res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ error: "Failed to log out." });
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
};

module.exports = authController;
