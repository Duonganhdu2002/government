/**
 * db.util.js
 * 
 * Utility functions for common database operations
 * Abstracts repetitive PostgreSQL operations
 */

const pool = require('../config/database');
const redisClient = require('../config/redis');

/**
 * Executes a query with error handling and retries
 * 
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} options - Additional options
 * @param {number} options.retries - Number of retries (default: 3)
 * @param {number} options.timeout - Query timeout in ms (default: 60000)
 * @returns {Promise<Object>} Query result
 * @throws {Error} Database error
 */
const executeQuery = async (query, params = [], options = {}) => {
  const retries = options.retries || 3;
  const timeout = options.timeout || 60000; // 60 seconds default timeout
  
  let lastError;
  let client = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a client from the pool with specific timeouts
      client = await pool.connect().catch(err => {
        console.error(`Failed to connect to database (attempt ${attempt + 1}/${retries + 1}):`, err);
        throw err; // Re-throw to be caught by the outer catch
      });
      
      try {
        // Set statement timeout for this query (in milliseconds)
        await client.query(`SET statement_timeout TO ${timeout}`);
        
        // Log the query for debugging purposes (without parameter values for security)
        console.log(`Executing query (attempt ${attempt + 1}/${retries + 1}): ${query.replace(/\s+/g, ' ').trim()} [${params.length} params]`);
        
        // Execute the query with the provided parameters
        const result = await client.query(query, params);
        return result;
      } finally {
        // Always release the client back to the pool if it exists
        if (client) {
          client.release(true); // true = terminate the connection if there was an error
        }
      }
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, error.message);
      
      // If this is a connection or timeout error and we have retries left
      const isConnectionError = error.code === 'ECONNREFUSED' || 
                               error.code === 'ETIMEDOUT' || 
                               error.code === '57P01' || // admin shutdown
                               error.code === '57014' || // query_canceled
                               error.code === '08006' || // connection failure
                               error.code === '08003' || // connection does not exist
                               error.code === '08004' || // rejected connection
                               error.code === '08001' || // unable to connect
                               error.code === '08007' || // transaction state unknown
                               (error.message && (error.message.includes('timeout') || 
                                                 error.message.includes('terminated')));
      
      if (isConnectionError && attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(100 * Math.pow(2, attempt), 3000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For the last attempt, add more context to the error
      if (attempt === retries) {
        console.error('All retry attempts failed for query:', query);
        console.error('Last error:', lastError);
        
        // Wrap the original error with more context
        const enhancedError = new Error(`Database query failed after ${retries + 1} attempts: ${lastError.message}`);
        enhancedError.originalError = lastError;
        enhancedError.query = query;
        enhancedError.params = params.map(p => typeof p === 'string' ? p.substring(0, 10) + '...' : p); // Sanitize params
        
        throw enhancedError;
      }
      
      // Re-throw the error on last attempt
      throw error;
    }
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