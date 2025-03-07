/**
 * error.middleware.js
 * 
 * Global error handling middleware
 * Provides consistent error response format and logging
 */

/**
 * Error handler for 404 Not Found
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler middleware
 * Formats and returns all errors in a consistent way
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code if not provided
  const statusCode = err.statusCode || 500;
  
  // Log error details
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.userId || 'unauthenticated'
  });
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred',
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    // Include validation errors if available
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Async function error wrapper
 * Catches errors from async/await functions and forwards them to error handler
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that forwards errors to next
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Creates a custom error with status code
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Custom error with status code
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncErrorHandler,
  createError
}; 