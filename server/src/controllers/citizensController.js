/**
 * citizensController.js
 * 
 * Controller for managing citizen data
 * Handles CRUD operations for citizen records
 */

const { executeQuery, getFromCacheOrExecute, invalidateCache } = require('../utils/db.util');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.util');
const bcrypt = require('bcrypt');

/**
 * Citizens Controller
 * Handles all operations related to citizen data
 */
const citizensController = {
  /**
   * Get all citizens with pagination
   * Supports caching for improved performance
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getAllCitizens: async (req, res) => {
    try {
      // Extract pagination parameters
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;
      
      // Generate cache key based on pagination
      const cacheKey = `citizens_page${page}_limit${limit}`;
      
      // Query with pagination
      const query = `
        SELECT * FROM citizens
        ORDER BY citizenid
        LIMIT $1 OFFSET $2;
      `;
      
      // Get count for pagination metadata
      const countResult = await executeQuery('SELECT COUNT(*) FROM citizens;');
      const totalItems = parseInt(countResult.rows[0].count, 10);
      
      // Get paginated data (with caching)
      const citizens = await getFromCacheOrExecute(
        cacheKey, 
        query, 
        [limit, offset],
        60 // Cache for 60 seconds
      );
      
      // If no citizens found
      if (!citizens || citizens.length === 0) {
        return sendNotFound(res, 'No citizens found');
      }
      
      // Return success with pagination metadata
      return sendSuccess(res, {
        citizens,
        pagination: {
          total: totalItems,
          page,
          limit,
          pages: Math.ceil(totalItems / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching citizens:', error);
      return sendError(res, 'Failed to fetch citizens');
    }
  },
  
  /**
   * Get citizen by ID
   * Supports caching for improved performance
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getCitizenById: async (req, res) => {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || isNaN(id)) {
      return sendError(res, 'Invalid citizen ID', 400);
    }
    
    try {
      // Generate cache key
      const cacheKey = `citizen_${id}`;
      
      // Query for single citizen
      const query = 'SELECT * FROM citizens WHERE citizenid = $1;';
      
      // Attempt to get from cache, then database
      const citizens = await getFromCacheOrExecute(cacheKey, query, [id], 60);
      
      // Check if citizen was found
      if (!citizens || citizens.length === 0) {
        return sendNotFound(res, 'Citizen not found');
      }
      
      // Return the citizen data
      return sendSuccess(res, citizens[0]);
    } catch (error) {
      console.error('Error fetching citizen by ID:', error);
      return sendError(res, 'Failed to fetch citizen');
    }
  },
  
  /**
   * Create a new citizen
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  createCitizen: async (req, res) => {
    const {
      fullname,
      identificationnumber,
      address,
      phonenumber,
      email,
      username,
      passwordhash,
      areacode,
      imagelink
    } = req.body;
    
    // Validation should be handled by middleware, but as a safeguard:
    if (!fullname || !identificationnumber || !username || !passwordhash || !areacode) {
      return sendError(res, 'Required fields are missing', 400);
    }
    
    try {
      // Hash password if not already hashed
      let securePassword = passwordhash;
      if (!passwordhash.startsWith('$2b$') && !passwordhash.startsWith('$2a$')) {
        // Hash the password with bcrypt
        const saltRounds = 10;
        securePassword = await bcrypt.hash(passwordhash, saltRounds);
      }
      
      // Insert new citizen
      const result = await executeQuery(
        `INSERT INTO citizens (
          fullname, identificationnumber, address, phonenumber, 
          email, username, passwordhash, areacode, imagelink
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *;`,
        [
          fullname, identificationnumber, address, phonenumber,
          email, username, securePassword, areacode, imagelink
        ]
      );
      
      // Invalidate citizens cache
      await invalidateCache('citizens_*');
      
      // Return the created citizen
      return sendSuccess(res, result.rows[0], 'Citizen created successfully', 201);
    } catch (error) {
      console.error('Error creating citizen:', error);
      
      // Check for duplicate key violation
      if (error.code === '23505') {
        return sendError(
          res, 
          'A citizen with the same identification number or username already exists', 
          409
        );
      }
      
      return sendError(res, 'Failed to create citizen', 500);
    }
  },
  
  /**
   * Update an existing citizen
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  updateCitizen: async (req, res) => {
    const { id } = req.params;
    const {
      fullname,
      identificationnumber,
      address,
      phonenumber,
      email,
      username,
      passwordhash,
      areacode,
      imagelink
    } = req.body;
    
    // Validate ID parameter
    if (!id || isNaN(id)) {
      return sendError(res, 'Invalid citizen ID', 400);
    }
    
    try {
      // First check if citizen exists
      const checkResult = await executeQuery(
        'SELECT citizenid FROM citizens WHERE citizenid = $1;',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return sendNotFound(res, 'Citizen not found');
      }
      
      // Process password if included
      let securePassword = passwordhash;
      if (passwordhash && !passwordhash.startsWith('$2b$') && !passwordhash.startsWith('$2a$')) {
        // Hash the password with bcrypt
        const saltRounds = 10;
        securePassword = await bcrypt.hash(passwordhash, saltRounds);
      }
      
      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      if (fullname) {
        updates.push(`fullname = $${paramIndex++}`);
        values.push(fullname);
      }
      
      if (identificationnumber) {
        updates.push(`identificationnumber = $${paramIndex++}`);
        values.push(identificationnumber);
      }
      
      if (address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(address);
      }
      
      if (phonenumber !== undefined) {
        updates.push(`phonenumber = $${paramIndex++}`);
        values.push(phonenumber);
      }
      
      if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
      }
      
      if (username) {
        updates.push(`username = $${paramIndex++}`);
        values.push(username);
      }
      
      if (passwordhash) {
        updates.push(`passwordhash = $${paramIndex++}`);
        values.push(securePassword);
      }
      
      if (areacode) {
        updates.push(`areacode = $${paramIndex++}`);
        values.push(areacode);
      }
      
      if (imagelink !== undefined) {
        updates.push(`imagelink = $${paramIndex++}`);
        values.push(imagelink);
      }
      
      // If no fields to update
      if (updates.length === 0) {
        return sendError(res, 'No fields to update', 400);
      }
      
      // Add ID to values array
      values.push(id);
      
      // Execute update query
      const result = await executeQuery(
        `UPDATE citizens
         SET ${updates.join(', ')}
         WHERE citizenid = $${paramIndex}
         RETURNING *;`,
        values
      );
      
      // Invalidate related caches
      await invalidateCache(`citizen_${id}`);
      await invalidateCache('citizens_*');
      
      // Return updated citizen
      return sendSuccess(res, result.rows[0], 'Citizen updated successfully');
    } catch (error) {
      console.error('Error updating citizen:', error);
      
      // Check for duplicate key violation
      if (error.code === '23505') {
        return sendError(
          res, 
          'A citizen with the same identification number or username already exists', 
          409
        );
      }
      
      return sendError(res, 'Failed to update citizen');
    }
  },
  
  /**
   * Delete a citizen
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  deleteCitizen: async (req, res) => {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || isNaN(id)) {
      return sendError(res, 'Invalid citizen ID', 400);
    }
    
    try {
      // Attempt to delete the citizen
      const result = await executeQuery(
        'DELETE FROM citizens WHERE citizenid = $1 RETURNING citizenid;',
        [id]
      );
      
      // Check if citizen was found
      if (result.rows.length === 0) {
        return sendNotFound(res, 'Citizen not found');
      }
      
      // Invalidate related caches
      await invalidateCache(`citizen_${id}`);
      await invalidateCache('citizens_*');
      
      // Return success message
      return sendSuccess(res, { id: result.rows[0].citizenid }, 'Citizen deleted successfully');
    } catch (error) {
      console.error('Error deleting citizen:', error);
      
      // Check for foreign key constraint
      if (error.code === '23503') {
        return sendError(
          res, 
          'Cannot delete citizen because they have associated records', 
          409
        );
      }
      
      return sendError(res, 'Failed to delete citizen');
    }
  }
};

module.exports = citizensController;
