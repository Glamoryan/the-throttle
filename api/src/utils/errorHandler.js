/**
 * Error Handling Utilities
 * 
 * @module utils/errorHandler
 * @description Contains error handler middleware and custom error classes
 * for centralized error handling across the application.
 */

/**
 * Custom API Error class
 * 
 * @class ApiError
 * @extends Error
 * @description Custom error class for API specific errors with status code
 */
class ApiError extends Error {
  /**
   * Creates an instance of ApiError
   * 
   * @constructor
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {object} [data] - Optional additional error data
   */
  constructor(statusCode, message, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * 
 * @function errorHandler
 * @param {Error|ApiError} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {object} JSON response with error details
 * @description Catches all errors thrown in the application and formats them 
 * into a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let data = err.data || null;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    data = Object.values(err.errors).map(e => e.message);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    data = err.keyValue;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    data,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  ApiError,
  errorHandler
}; 