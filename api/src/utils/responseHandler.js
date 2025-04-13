/**
 * Response Handler Utilities
 * 
 * @module utils/responseHandler
 * @description Provides standardized response formats for API endpoints,
 * ensuring consistent success and error responses throughout the application.
 */

/**
 * Standardized format for successful API responses
 * 
 * @function successResponse
 * @param {object} res - Express response object
 * @param {number} [statusCode=200] - HTTP status code
 * @param {string} [message='Success'] - Success message
 * @param {*} [data=null] - Response data (optional)
 * @returns {object} Standardized response with success status
 * @description Creates a standardized success response with consistent format
 */
exports.successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    status: 'success',
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standardized format for error API responses
 * 
 * @function errorResponse
 * @param {object} res - Express response object
 * @param {number} [statusCode=500] - HTTP status code
 * @param {string} [message='An error occurred'] - Error message
 * @param {*} [error=null] - Error details (optional)
 * @returns {object} Standardized error response
 * @description Creates a standardized error response with consistent format.
 * Includes detailed error information in development environment.
 */
exports.errorResponse = (res, statusCode = 500, message = 'An error occurred', error = null) => {
  const response = {
    status: 'error',
    message
  };

  // Add error details in development environment
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = typeof error === 'object' ? 
      {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : 
      error;
  }

  return res.status(statusCode).json(response);
}; 