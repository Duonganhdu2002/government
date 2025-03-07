/**
 * validation.middleware.js
 * 
 * Provides middleware functions for validating request data
 * Used to ensure data integrity and security
 */

/**
 * Validates citizen data in the request body for POST and PUT requests
 * Requires all mandatory fields to be present
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validateCitizenData = (req, res, next) => {
  // Skip strict validation for PATCH requests (use validatePartialCitizenData instead)
  if (req.method === 'PATCH') {
    return next();
  }
  
  const { fullname, identificationnumber, username, passwordhash, areacode } = req.body;
  
  if (!fullname || !identificationnumber || !username || !passwordhash || !areacode) {
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing',
      missingFields: [
        !fullname ? 'fullname' : null,
        !identificationnumber ? 'identificationnumber' : null,
        !username ? 'username' : null,
        !passwordhash ? 'passwordhash' : null,
        !areacode ? 'areacode' : null
      ].filter(Boolean)
    });
  }
  
  // Validate identification number format (if needed)
  if (identificationnumber && !/^\d{9,12}$/.test(identificationnumber)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid identification number format'
    });
  }
  
  // Validate email format if provided
  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email format'
    });
  }

  next();
};

/**
 * Validates citizen data in the request body for PATCH requests
 * Only validates fields that are actually present in the request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validatePartialCitizenData = (req, res, next) => {
  const { identificationnumber, email } = req.body;
  
  // Only validate identification number if it's provided
  if (identificationnumber !== undefined && !/^\d{9,12}$/.test(identificationnumber)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid identification number format'
    });
  }
  
  // Only validate email if it's provided
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email format'
    });
  }

  next();
};

/**
 * Validates application data in the request body
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validateApplicationData = (req, res, next) => {
  const { citizenid, applicationtypeid, content } = req.body;
  
  if (!citizenid || !applicationtypeid || !content) {
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing',
      missingFields: [
        !citizenid ? 'citizenid' : null,
        !applicationtypeid ? 'applicationtypeid' : null,
        !content ? 'content' : null
      ].filter(Boolean)
    });
  }
  
  next();
};

/**
 * Validates ID parameter
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID parameter'
    });
  }
  
  next();
};

/**
 * Validates pagination parameters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  
  // Default values
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  
  // Validate ranges
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;
  
  // Attach validated params to req
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

module.exports = {
  validateCitizenData,
  validatePartialCitizenData,
  validateApplicationData,
  validateIdParam,
  validatePagination
}; 