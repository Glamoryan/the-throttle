const User = require('../models/User');
const { ApiError } = require('../utils/errorHandler');
const repositoryFactory = require('./repositoryFactory');

class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} - Created user
   */
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (usually email or username)
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User>} - Found user
   */
  async findByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<User>} - Found user
   */
  async findById(id) {
    const user = await User.findById(id);
    return user;
  }

  /**
   * Update user by ID
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<User>} - Updated user
   */
  async updateUser(id, updates) {
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  }
}

// Register this repository with the factory
const userRepository = new UserRepository();
repositoryFactory.register('user', userRepository);

module.exports = userRepository; 