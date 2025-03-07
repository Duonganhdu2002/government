/**
 * redis.js
 * 
 * Redis client configuration for caching
 * Implements connection and error handling for Redis
 */

const { createClient } = require('redis');
require('dotenv').config();

/**
 * Format Redis URL from components if not provided as complete URL
 * 
 * @param {string} url - Redis URL from environment or components
 * @param {string} host - Redis host
 * @param {string} port - Redis port
 * @param {string} password - Redis password
 * @returns {string} Properly formatted Redis URL
 */
const formatRedisUrl = (url, host, port, password) => {
  // If full URL is provided and valid, use it
  if (url && (url.startsWith('redis://') || url.startsWith('rediss://'))) {
    return url;
  }
  
  // If host:port format is provided
  if (url && url.includes(':')) {
    const [hostPart, portPart] = url.split(':');
    host = hostPart || host;
    port = portPart || port;
  }
  
  // Default values
  host = host || 'localhost';
  port = port || '6379';
  
  // Build URL
  let formattedUrl = `redis://${host}:${port}`;
  
  // Add authentication if password is provided
  if (password) {
    formattedUrl = `redis://:${encodeURIComponent(password)}@${host}:${port}`;
  }
  
  return formattedUrl;
};

// Format Redis URL from environment variables
const redisUrl = formatRedisUrl(
  process.env.REDIS_URL,
  process.env.REDIS_HOST,
  process.env.REDIS_PORT,
  process.env.REDIS_PASSWORD
);

// Create a mock Redis client if unable to connect
let redisClient;

/**
 * Create a mock Redis client with same interface
 * Used when Redis is not available to prevent application failure
 * 
 * @returns {Object} Mock Redis client
 */
const createMockRedisClient = () => {
  console.warn('Using mock Redis client - caching disabled');
  
  // In-memory storage for mock
  const store = new Map();
  
  return {
    connect: async () => Promise.resolve(),
    get: async (key) => store.get(key) || null,
    set: async (key, value, options = {}) => {
      store.set(key, value);
      // Handle expiry if specified
      if (options.EX) {
        setTimeout(() => store.delete(key), options.EX * 1000);
      }
      return 'OK';
    },
    del: async (keys) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      let deleted = 0;
      for (const key of keysArray) {
        if (store.delete(key)) deleted++;
      }
      return deleted;
    },
    scan: async (cursor, options = {}) => {
      const keys = Array.from(store.keys());
      return { cursor: '0', keys };
    },
    quit: async () => Promise.resolve('OK'),
    on: (event, listener) => {}
  };
};

try {
  /**
   * Configure Redis client with appropriate options
   */
  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        // Exponential backoff with a maximum delay of 10 seconds
        const delay = Math.min(Math.pow(2, retries) * 100, 10000);
        return delay;
      },
      connectTimeout: 5000, // 5 seconds
    },
  });

  // Error handling for Redis client
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
  });

  // Connect to Redis - this is async
  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      // Replace with mock client
      redisClient = createMockRedisClient();
    }
  })();
} catch (error) {
  console.error('Error creating Redis client:', error);
  // Use mock client as fallback
  redisClient = createMockRedisClient();
}

/**
 * Enhanced Redis Client with improved error handling
 */
const enhancedRedisClient = {
  /**
   * Get value from Redis cache
   * 
   * @param {string} key - Cache key
   * @returns {Promise<string|null>} The cached value or null
   */
  get: async (key) => {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error(`Redis get error for key "${key}":`, err);
      return null;
    }
  },

  /**
   * Set value in Redis cache
   * 
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   * @param {Object} options - Redis SET options
   * @returns {Promise<string|null>} Redis response or null
   */
  set: async (key, value, options = {}) => {
    try {
      return await redisClient.set(key, value, options);
    } catch (err) {
      console.error(`Redis set error for key "${key}":`, err);
      return null;
    }
  },

  /**
   * Delete cache key(s)
   * 
   * @param {string|string[]} keys - Key or array of keys to delete
   * @returns {Promise<number|null>} Number of keys deleted or null
   */
  del: async (keys) => {
    try {
      return await redisClient.del(keys);
    } catch (err) {
      console.error(`Redis del error for key(s) "${keys}":`, err);
      return null;
    }
  },

  /**
   * Scan Redis for keys matching a pattern
   * 
   * @param {string} cursor - Redis cursor
   * @param {Object} options - Scan options
   * @returns {Promise<Object|null>} Scan results or null
   */
  scan: async (cursor, options = {}) => {
    try {
      return await redisClient.scan(cursor, options);
    } catch (err) {
      console.error(`Redis scan error:`, err);
      return { cursor: '0', keys: [] };
    }
  },

  /**
   * Quit Redis connection
   * 
   * @returns {Promise<string|null>} Redis quit response or null
   */
  quit: async () => {
    try {
      return await redisClient.quit();
    } catch (err) {
      console.error('Redis quit error:', err);
      return null;
    }
  }
};

module.exports = enhancedRedisClient;
