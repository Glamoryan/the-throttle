const { verifyToken } = require('../utils/jwtUtils');
const { ApiError } = require('../utils/errorHandler');
const userRepository = require('../repositories/userRepository');

/**
 * Middleware to authenticate user based on JWT token
 * 
 * @async
 * @function authenticate
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Passes to the next middleware if authentication is successful
 * @throws {ApiError} - Returns 401 if token is missing or invalid, 403 if user account is deactivated
 * @description Validates the JWT token from the Authorization header and attaches the user object to the request
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('Auth middleware executed:', req.path);

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token not found or not in Bearer format');
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('Token not found');
      throw new ApiError(401, 'Authentication required');
    }
    
    console.log('Token found, verifying');

    const decoded = verifyToken(token);
    console.log('Token verified:', decoded);

    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      console.log('User not found:', decoded.id);
      throw new ApiError(401, 'Invalid token: User not found');
    }
    
    if (!user.active) {
      console.log('User is not active:', user._id);
      throw new ApiError(403, 'User account is deactivated');
    }
    
    console.log('Authentication successful, user:', user._id);

    req.user = user;
    req.role = decoded.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 * 
 * @function authorize
 * @param {string[]} roles - Array of allowed roles
 * @returns {function} - Express middleware function to check user roles
 * @throws {ApiError} - Returns 401 if not authenticated, 403 if user lacks required role
 * @description Creates a middleware that verifies if the authenticated user has one of the required roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    
    if (!roles.includes(req.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
}; 