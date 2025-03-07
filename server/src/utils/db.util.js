/**
 * db.util.js
 * 
 * Utility functions for common database operations
 * Abstracts repetitive PostgreSQL operations
 */

const pool = require('../config/database');
const redisClient = require('../config/redis');

/**
 * Executes a query with error handling
 * 
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 * @throws {Error} Database error
 */
const executeQuery = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Generates SQL for pagination
 * 
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Object} SQL pagination object
 */
const getPaginationSQL = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  return {
    limitClause: `LIMIT ${limit} OFFSET ${offset}`,
    params: [],
    metadata: {
      page,
      limit,
      offset
    }
  };
};

/**
 * Creates cache key from parameters
 * 
 * @param {string} prefix - Cache key prefix
 * @param {Object} params - Parameters to include in key
 * @returns {string} Formatted cache key
 */
const createCacheKey = (prefix, params = {}) => {
  let key = prefix;
  
  if (Object.keys(params).length > 0) {
    key += '_' + Object.entries(params)
      .map(([k, v]) => `${k}:${v}`)
      .join('_');
  }
  
  return key;
};

/**
 * Gets data from cache or executes query
 * 
 * @param {string} cacheKey - Redis cache key
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {number} expiry - Cache expiry time in seconds
 * @returns {Promise<Object>} Data from cache or database
 */
const getFromCacheOrExecute = async (cacheKey, query, params = [], expiry = 60) => {
  try {
    // Try to get from cache
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    // Execute query if not in cache
    console.log(`Cache miss for key: ${cacheKey}. Executing query...`);
    const result = await executeQuery(query, params);
    
    // Store in cache
    if (result.rows) {
      await redisClient.set(cacheKey, JSON.stringify(result.rows), {
        EX: expiry
      });
    }
    
    return result.rows;
  } catch (error) {
    console.error('Cache/DB operation error:', error);
    throw error;
  }
};

/**
 * Invalidates cache keys that match a pattern
 * 
 * @param {string} pattern - Redis key pattern to invalidate
 * @returns {Promise<void>}
 */
const invalidateCache = async (pattern) => {
  try {
    // Use Redis SCAN to find keys matching pattern
    let cursor = '0';
    let keys = [];
    
    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      
      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== '0');
    
    // Delete found keys
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
    throw error;
  }
};

module.exports = {
  executeQuery,
  getPaginationSQL,
  createCacheKey,
  getFromCacheOrExecute,
  invalidateCache
}; 