const userRepository = require('../repositories/userRepository');
const { ApiError } = require('../utils/errorHandler');
const { generateToken } = require('../utils/jwtUtils');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - User object and token
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
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User object and token
   */
  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    return { user, token };
  }
  
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<User>} - User profile
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