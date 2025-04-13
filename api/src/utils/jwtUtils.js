/**
 * JWT Utilities
 * 
 * @module utils/jwtUtils
 * @description Provides utilities for working with JSON Web Tokens,
 * including token generation and verification.
 */
const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

/**
 * Generate a JWT token for user authentication
 * 
 * @function generateToken
 * @param {string} userId - MongoDB user ID
 * @param {string} role - User role ('user' or 'admin')
 * @returns {string} - JWT token string
 * @description Creates a signed JWT token containing the user ID and role,
 * set to expire in 24 hours. Uses the JWT_SECRET environment variable.
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verify and decode a JWT token
 * 
 * @function verifyToken
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {ApiError} - 401 error if token is invalid or expired
 * @description Verifies that a JWT token is valid and not expired.
 * Returns the decoded token payload on success.
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 