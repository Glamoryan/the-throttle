const userRepository = require('../repositories/userRepository');
const { ApiError } = require('../utils/errorHandler');
const { generateToken } = require('../utils/jwtUtils');

/**
 * Authentication Service
 * 
 * @class AuthService
 * @description Handles authentication business logic including user registration, 
 * login, and profile retrieval. Implements service layer pattern to separate 
 * business logic from controllers and data access.
 */
class AuthService {
  /**
   * Register a new user
   * 
   * @async
   * @method register
   * @memberof AuthService
   * @param {Object} userData - User registration data
   * @param {string} userData.username - User's username
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password (will be hashed)
   * @returns {Promise<Object>} - Object containing user data and JWT token
   * @throws {ApiError} - If registration fails (e.g., duplicate email/username)
   * @description Creates a new user account and generates a JWT token for authentication
   */
  async register({ username, email, password }) {
    try {
      // Create user with the password as passwordHash
      // The pre-save hook in the User model will hash it
      const user = await userRepository.createUser({
        username,
        email,
        passwordHash: password
      });
      
      const token = generateToken(user._id, user.role);
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Login a user
   * 
   * @async
   * @method login
   * @memberof AuthService
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Object containing user data and JWT token
   * @throws {ApiError} - 401 error if credentials are invalid
   * @description Authenticates a user with email and password, returning user data and JWT token on success
   */
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await user.verifyPassword(password);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);
    
    return { user, token };
  }
  
  /**
   * Get user profile by ID
   * 
   * @async
   * @method getProfile
   * @memberof AuthService
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   * @throws {ApiError} - 404 error if user not found
   * @description Retrieves a user's profile information by their ID
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  }
}

module.exports = new AuthService(); 