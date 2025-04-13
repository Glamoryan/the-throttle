/**
 * Express Server Entry Point
 * 
 * @module src/index
 * @description Main application file that initializes the Express server,
 * configures middleware, sets up routes, and handles connections to MongoDB.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const app = express();

connectDB();

/**
 * CORS configuration middleware
 * Enables Cross-Origin Resource Sharing with specific settings
 */
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 * Logs all incoming requests with timestamp, method and URL
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);

/**
 * Health check endpoint
 * 
 * @function healthCheckHandler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JSON response with API status information
 * @description Provides a simple endpoint to verify API is running correctly
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

/**
 * Not found middleware
 * Handles requests to undefined routes
 * 
 * @function notFoundHandler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {object} 404 JSON response
 */
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

mongoose.connection.on('error', (err) => { // To-do: remove because, it's already exists in db.js
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => { // To-do: remove because, it's already exists in db.js
  console.log('MongoDB connection lost.');
});

// Global error handler
app.use(errorHandler);

/**
 * Server initialization
 * Starts the Express server on the specified port
 */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 