const authService = require('../services/authService');
const { ApiError } = require('../utils/errorHandler');

/**
 * Controller function that handles user registration
 * 
 * @async
 * @function register
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.username - User's username
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Returns status 201 with user and token information
 * @throws {ApiError} - Returns 400 error code if required fields are missing
 * @description Creates a new user and returns user details with JWT token upon success
 * @route POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new ApiError(400, 'Username, email and password are required');
    }

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
 * Controller function that handles user login
 * 
 * @async
 * @function login
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Returns status 200 with user and token information
 * @throws {ApiError} - Returns 400 error code if required fields are missing
 * @description Authenticates a user and returns user details with JWT token upon successful login
 * @route POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

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
 * Controller function that retrieves user profile information
 * 
 * @async
 * @function getProfile
 * @param {object} req - Express request object
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Returns status 200 with user information
 * @description Returns the currently authenticated user's profile information
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
 * Controller function that handles user logout
 * 
 * @function logout
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void} - Returns status 200 with success message
 * @description Handles user logout. For JWT authentication, this is primarily 
 * for API completeness as the actual token invalidation happens client-side.
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