const User = require('../models/User');
const { ApiError } = require('../utils/errorHandler');
const repositoryFactory = require('./repositoryFactory');

/**
 * Repository class for User model operations
 * 
 * @class UserRepository
 * @description Handles database operations for the User model, including CRUD operations
 * and specialized queries. Implements the Repository pattern for user data access.
 */
class UserRepository {
  /**
   * Create a new user
   * 
   * @async
   * @method createUser
   * @memberof UserRepository
   * @param {Object} userData - User data
   * @param {string} userData.username - User's username
   * @param {string} userData.email - User's email address
   * @param {string} userData.passwordHash - User's password (will be hashed)
   * @param {string} [userData.role] - User's role (defaults to 'user')
   * @returns {Promise<Object>} - Created user object
   * @throws {ApiError} - Throws 400 error if username or email already exists
   * @description Creates a new user in the database with the provided data
   */
  async createUser(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      if (error.code === 11000) { // To-do: move to errorHandler maybe?!
        // Duplicate key error (usually email or username)
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * 
   * @async
   * @method findByEmail
   * @memberof UserRepository
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - Found user or null if not found
   * @description Retrieves a user from the database by their email address
   */
  async findByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }

  /**
   * Find user by ID
   * 
   * @async
   * @method findById
   * @memberof UserRepository
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} - Found user or null if not found
   * @description Retrieves a user from the database by their MongoDB ID.
   * Returns null if ID is invalid or user is not found.
   */
  async findById(id) {
    try {
      console.log('findById called with id:', id);
      
      if (!id) {
        console.error('findById: id is null or undefined');
        return null;
      }
      
      // Check for valid MongoDB ObjectId format
      if (id.length !== 24) {
        console.error('findById: invalid id format:', id);
        return null;
      }
      
      const user = await User.findById(id);
      console.log('findById result:', user ? 'User found' : 'User not found');
      return user;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Update user by ID
   * 
   * @async
   * @method updateUser
   * @memberof UserRepository
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated user
   * @throws {ApiError} - Throws 404 error if user not found
   * @description Updates a user in the database with the provided fields.
   * Returns the updated user document.
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