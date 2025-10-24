/**
 * Response Handler Utility
 * Standardizes API responses
 */

const logger = require('../config/logger');

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code
 * @param {object} details - Additional error details (dev only)
 */
function sendError(res, error, statusCode = 500, details = null) {
  const response = {
    success: false,
    error
  };

  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
  }

  logger.error(`API Error: ${error}`, { statusCode, details });
  res.status(statusCode).json(response);
}

/**
 * Send paginated response
 * @param {object} res - Express response object
 * @param {array} data - Response data
 * @param {object} pagination - Pagination info
 */
function sendPaginated(res, data, pagination) {
  res.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  });
}

/**
 * Send unauthorized response (401)
 * @param {object} res - Express response object
 * @param {string} error - Error message
 */
function sendUnauthorized(res, error = 'No autorizado') {
  res.status(401).json({
    success: false,
    error
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendUnauthorized
};
