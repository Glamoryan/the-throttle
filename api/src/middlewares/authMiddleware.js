const { verifyToken } = require('../utils/jwtUtils');
const { ApiError } = require('../utils/errorHandler');
const userRepository = require('../repositories/userRepository');

/**
 * Middleware to authenticate user based on JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      throw new ApiError(401, 'Invalid token: User not found');
    }
    
    if (!user.active) {
      throw new ApiError(403, 'User account is deactivated');
    }
    
    // Attach user to request object
    req.user = user;
    req.role = decoded.role;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
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