const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Mongoose schema for User model
 * 
 * @typedef {Object} UserSchema
 * @property {string} username - Unique username for the user
 * @property {string} email - Unique email address of the user
 * @property {string} passwordHash - Hashed password (not exposed in JSON responses)
 * @property {string} role - User role ('user' or 'admin')
 * @property {boolean} active - Whether the user account is active
 * @property {Date} createdAt - Automatically added timestamp for creation
 * @property {Date} updatedAt - Automatically added timestamp for updates
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Pre-save middleware to hash the password before saving
 * 
 * @async
 * @function preSaveMiddleware
 * @memberof UserSchema
 * @param {function} next - Mongoose middleware next function
 * @description
 * Automatically hashes the password before saving to the database
 * Only runs when the password field is modified
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Instance method to verify a password against the stored hash
 * 
 * @async
 * @method verifyPassword
 * @memberof UserSchema
 * @instance
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 * @description
 * Compares a plain text password with the stored hash using bcrypt
 */
userSchema.methods.verifyPassword = async function(password) { // To-do: move to service layer
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema); 