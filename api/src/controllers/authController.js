const authService = require('../services/authService');
const { ApiError } = require('../utils/errorHandler');

/**
 * Register user controller
 * @route POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      throw new ApiError(400, 'Username, email and password are required');
    }
    
    // Register user
    const { user, token } = await authService.register({ username, email, password });
    
    res.status(201).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user controller
 * @route POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }
    
    // Login user
    const { user, token } = await authService.login(email, password);
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile controller
 * @route GET /auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout controller - client-side only for JWT
 * @route POST /auth/logout
 */
const logout = (req, res) => {
  // For JWT, the client simply discards the token
  // This endpoint is for semantic completeness of the API
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  logout
}; 