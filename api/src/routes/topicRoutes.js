/**
 * Topic and Roadmap Routes
 * 
 * @module routes/topicRoutes
 * @description Express router for topic and roadmap related endpoints.
 * Handles CRUD operations for topics, roadmaps, and subtopics.
 * Most routes are protected and require authentication via JWT token.
 * Includes endpoints for retrieving public roadmaps without authentication.
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  getChildTopics,
  getUserRoadmaps,
  getAllRoadmaps
} = require('../controllers/topicController');

/**
 * Middleware for error handling in routes
 * 
 * @function asyncHandler
 * @param {Function} fn - Async controller function to wrap
 * @returns {Function} Express middleware function with error handling
 * @description Wraps async controller functions to properly catch and forward errors to Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all public roadmaps (no authentication required)
router.get('/public/roadmaps', asyncHandler(getAllRoadmaps));

// Authentication required for all routes below
router.use(authenticate);

// Get user's roadmaps
router.get('/roadmaps', asyncHandler(getUserRoadmaps));

// Get all topics
router.get('/', asyncHandler(getAllTopics));

// Get a specific topic
router.get('/:id', asyncHandler(getTopicById));

// Get child topics
router.get('/:id/children', asyncHandler(getChildTopics));

// Create a new topic
router.post('/', asyncHandler(createTopic));

// Update a topic
router.put('/:id', asyncHandler(updateTopic));

// Delete a topic
router.delete('/:id', asyncHandler(deleteTopic));

module.exports = router; 