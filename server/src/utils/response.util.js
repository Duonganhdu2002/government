/**
 * response.util.js
 * 
 * Utility functions for generating standardized API responses
 * Ensures consistent response format throughout the application
 */

/**
 * Generates a success response object
 * 
 * @param {Object} data - The data to include in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Formatted success response
 */
const success = (data = null, message = 'Operation successful', statusCode = 200) => {
  return {
    status: 'success',
    message,
    data,
    statusCode
  };
};

/**
 * Generates an error response object
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Additional error details
 * @returns {Object} Formatted error response
 */
const error = (message = 'An error occurred', statusCode = 500, errors = null) => {
  return {
    status: 'error',
    message,
    errors,
    statusCode
  };
};

/**
 * Sends a success response
 * 
 * @param {Object} res - Express response object
 * @param {Object} data - The data to include in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json(success(data, message, statusCode));
};

/**
 * Sends an error response
 * 
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Additional error details
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json(error(message, statusCode, errors));
};

/**
 * Handles a not found response
 * 
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

/**
 * Handles a bad request response
 * 
 * @param {Object} res - Express response object
 * @param {string} message - Bad request message
 * @param {Object} errors - Validation errors
 */
const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, message, 400, errors);
};

module.exports = {
  success,
  error,
  sendSuccess,
  sendError,
  sendNotFound,
  sendBadRequest
}; 