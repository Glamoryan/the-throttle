const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

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