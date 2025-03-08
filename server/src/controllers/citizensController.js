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
      
      // Query for single citizen with explicit column names instead of SELECT *
      const query = 'SELECT citizenid, fullname, username, email, identificationnumber, phonenumber, address, areacode FROM citizens WHERE citizenid = $1;';
      
      // Attempt to get from cache, then database
      const citizens = await getFromCacheOrExecute(cacheKey, query, [id], 60);
      
      // Check if citizen was found
      if (!citizens || citizens.length === 0) {
        return sendNotFound(res, 'Citizen not found');
      }
      
      // Return the citizen data with imagelink set to null
      const citizenData = {
        ...citizens[0],
        imagelink: null // Add null imagelink to maintain consistency with frontend expectations
      };
      
      return sendSuccess(res, citizenData);
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
    try {
      // Extract citizen data from request body
      const {
        fullname,
        identificationnumber,
        phonenumber,
        address,
        email,
        username,
        password,
        areacode,
        // Remove imagelink from the destructuring since it doesn't exist
      } = req.body;
      
      // Check if citizen already exists with the same identification number
      const existingCitizen = await executeQuery(
        'SELECT * FROM citizens WHERE identificationnumber = $1 OR username = $2 OR email = $3',
        [identificationnumber, username, email]
      );
      
      if (existingCitizen.rows.length > 0) {
        return sendError(res, 'Citizen with this identification number, username, or email already exists', 409);
      }
      
      // Hash the password
      const saltRounds = 10;
      const securePassword = await bcrypt.hash(password, saltRounds);
      
      // Insert new citizen into database (removed imagelink from the query)
      const result = await executeQuery(
        `INSERT INTO citizens (fullname, identificationnumber, phonenumber, address, 
          email, username, passwordhash, areacode) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [fullname, identificationnumber, phonenumber, address, 
          email, username, securePassword, areacode]
      );
      
      // Clear cache after insert
      await invalidateCache('citizens_*');
      
      // Return new citizen data with null imagelink
      const newCitizen = {
        ...result.rows[0],
        imagelink: null
      };
      
      return sendSuccess(res, newCitizen, 'Citizen created successfully', 201);
    } catch (error) {
      console.error('Error creating citizen:', error);
      return sendError(res, 'Failed to create citizen');
    }
  },
  
  /**
   * Update citizen data
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  updateCitizen: async (req, res) => {
    const { id } = req.params;
    console.log('Updating citizen:', id);
    
    // Validate ID parameter
    if (!id || isNaN(id)) {
      return sendError(res, 'Invalid citizen ID', 400);
    }
    
    try {
      // Check if citizen exists
      const citizenCheck = await executeQuery(
        'SELECT * FROM citizens WHERE citizenid = $1',
        [id]
      );
      
      if (citizenCheck.rows.length === 0) {
        return sendNotFound(res, 'Citizen not found');
      }
      
      // Extract fields from request body
      const { 
        fullname, 
        identificationnumber, 
        phonenumber, 
        address, 
        email, 
        username, 
        password,
        areacode
      } = req.body;
      
      // Build update fields
      let updates = [];
      let values = [id]; // First parameter is always ID
      let paramIndex = 2;
      
      // Add each provided field to the update query
      if (fullname !== undefined) {
        updates.push(`fullname = $${paramIndex++}`);
        values.push(fullname);
      }
      
      if (identificationnumber !== undefined) {
        updates.push(`identificationnumber = $${paramIndex++}`);
        values.push(identificationnumber);
      }
      
      if (phonenumber !== undefined) {
        updates.push(`phonenumber = $${paramIndex++}`);
        values.push(phonenumber);
      }
      
      if (address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(address);
      }
      
      if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
      }
      
      if (username !== undefined) {
        updates.push(`username = $${paramIndex++}`);
        values.push(username);
      }
      
      if (password !== undefined) {
        const saltRounds = 10;
        const securePassword = await bcrypt.hash(password, saltRounds);
        updates.push(`passwordhash = $${paramIndex++}`);
        values.push(securePassword);
      }
      
      if (areacode !== undefined) {
        updates.push(`areacode = $${paramIndex++}`);
        values.push(areacode);
      }
      
      // If no updates provided
      if (updates.length === 0) {
        return sendError(res, 'No update data provided', 400);
      }
      
      // Execute update query
      const query = `
        UPDATE citizens 
        SET ${updates.join(', ')} 
        WHERE citizenid = $1 
        RETURNING *
      `;
      
      // Update database
      const result = await executeQuery(query, values);
      
      // Clear cache
      await invalidateCache(`citizen_${id}`);
      await invalidateCache('citizens_*');
      
      // Return updated citizen
      return sendSuccess(res, {
        ...result.rows[0],
        imagelink: null
      }, 'Citizen updated successfully');
    } catch (error) {
      console.error('Error updating citizen:', error);
      
      // Handle duplicate key error
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
