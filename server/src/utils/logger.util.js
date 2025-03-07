/**
 * logger.util.js
 * 
 * Centralized logging utility
 * Provides consistent logging across the application
 */

/**
 * Log levels
 * Define the priority of log messages
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level from environment or default to INFO
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? (LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO)
  : LOG_LEVELS.INFO;

/**
 * Format a log message with timestamp and metadata
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';
  
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
};

/**
 * Log an error message
 * 
 * @param {string} message - Error message
 * @param {Object} meta - Additional error details
 */
const error = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
    console.error(formatLogMessage('error', message, meta));
  }
};

/**
 * Log a warning message
 * 
 * @param {string} message - Warning message
 * @param {Object} meta - Additional warning details
 */
const warn = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
    console.warn(formatLogMessage('warn', message, meta));
  }
};

/**
 * Log an info message
 * 
 * @param {string} message - Info message
 * @param {Object} meta - Additional information
 */
const info = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    console.info(formatLogMessage('info', message, meta));
  }
};

/**
 * Log a debug message
 * 
 * @param {string} message - Debug message
 * @param {Object} meta - Additional debug details
 */
const debug = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    console.debug(formatLogMessage('debug', message, meta));
  }
};

/**
 * Log an HTTP request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} time - Request processing time in ms
 */
const httpRequest = (req, res, time) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime: `${time}ms`,
      userId: req.userId || 'anonymous',
      userAgent: req.headers['user-agent']
    };
    
    info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
  }
};

/**
 * Log database query
 * 
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {number} time - Query execution time in ms
 */
const dbQuery = (query, params, time) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    const meta = {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      executionTime: `${time}ms`
    };
    
    debug('Database query executed', meta);
  }
};

/**
 * Create a request logger middleware
 * 
 * @returns {Function} Express middleware function
 */
const requestLogger = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Log after response is sent
    res.on('finish', () => {
      const time = Date.now() - start;
      httpRequest(req, res, time);
    });
    
    next();
  };
};

module.exports = {
  error,
  warn,
  info,
  debug,
  httpRequest,
  dbQuery,
  requestLogger
}; 