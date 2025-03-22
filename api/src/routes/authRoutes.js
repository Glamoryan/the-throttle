const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// POST /auth/register - Register a new user
router.post('/register', authController.register);

// POST /auth/login - User login
router.post('/login', authController.login);

// GET /auth/profile - Get user profile (protected route)
router.get('/profile', authenticate, authController.getProfile);

// POST /auth/logout - Logout user
router.post('/logout', authController.logout);

module.exports = router; 