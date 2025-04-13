const Topic = require('../models/Topic');
const topicService = require('../services/topicService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Controller function that retrieves all roadmaps for the authenticated user
 * 
 * @async
 * @function getUserRoadmaps
 * @param {object} req - Express request object
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 with user's roadmaps
 * @throws {Error} - Returns 400 if user info is missing, 500 for server errors
 * @description Fetches all roadmaps that belong to the currently authenticated user
 * @route GET /topics/user/roadmaps
 */
exports.getUserRoadmaps = async (req, res) => {
  try {
    console.log('getUserRoadmaps called, user:', req.user);
    
    if (!req.user || !req.user._id) {
      console.error('User information missing:', req.user);
      return errorResponse(res, 400, 'User information missing or invalid');
    }

    const roadmaps = await topicService.getUserRoadmaps(req.user._id);
    console.log('Number of roadmaps retrieved:', roadmaps.length);
    
    return successResponse(res, 200, 'Roadmaps successfully retrieved', { roadmaps });
  } catch (error) {
    console.error('Error in getUserRoadmaps:', error);
    return errorResponse(res, 500, 'An error occurred while retrieving roadmaps', error);
  }
};

/**
 * Controller function that retrieves all public roadmaps
 * 
 * @async
 * @function getAllRoadmaps
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 with all public roadmaps
 * @throws {Error} - Returns 500 for server errors
 * @description Fetches all public roadmaps available in the system
 * @route GET /topics/roadmaps
 */
exports.getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await topicService.getAllRoadmaps();
    
    return successResponse(res, 200, 'All roadmaps successfully retrieved', { roadmaps });
  } catch (error) {
    console.error('Error in getAllRoadmaps:', error);
    return errorResponse(res, 500, 'An error occurred while retrieving roadmaps', error);
  }
};

/**
 * Controller function that retrieves all topics for the authenticated user
 * 
 * @async
 * @function getAllTopics
 * @param {object} req - Express request object
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 with all user's topics
 * @throws {Error} - Returns 500 for server errors
 * @description Fetches all topics belonging to the currently authenticated user
 * @route GET /topics
 */
exports.getAllTopics = async (req, res) => { // To-do: The getUserRoadmaps can be used instead of this
  try {
    const topics = await Topic.find({ ownerId: req.user._id });
    return successResponse(res, 200, 'Topics successfully retrieved', topics);
  } catch (error) {
    return errorResponse(res, 500, 'An error occurred while retrieving topics', error);
  }
};

/**
 * Controller function that retrieves a specific topic by ID
 * 
 * @async
 * @function getTopicById
 * @param {object} req - Express request object
 * @param {object} req.params - Request parameters
 * @param {string} req.params.id - Topic ID to retrieve
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 with the requested topic
 * @throws {Error} - Returns 404 if topic not found, 500 for server errors
 * @description Fetches a specific topic by ID for the authenticated user
 * @route GET /topics/:id
 */
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, ownerId: req.user._id });
    
    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }
    
    return successResponse(res, 200, 'Topic successfully retrieved', topic);
  } catch (error) {
    return errorResponse(res, 500, 'An error occurred while retrieving topic', error);
  }
};

/**
 * Controller function that creates a new topic or roadmap
 * 
 * @async
 * @function createTopic
 * @param {object} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.type - Topic type (e.g., 'roadmap', 'topic')
 * @param {string} req.body.title - Topic title
 * @param {string} [req.body.description] - Topic description
 * @param {string} [req.body.parentId] - Parent topic ID for hierarchical topics
 * @param {number} [req.body.weight] - Topic weight/order
 * @param {string} [req.body.status] - Topic status (default: 'pending')
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 201 with the created topic
 * @throws {Error} - Returns 500 for server errors
 * @description Creates a new topic or roadmap for the authenticated user
 * @route POST /topics
 */
exports.createTopic = async (req, res) => {
  try {
    const { type, title, description, parentId, weight, status } = req.body;

    if (type === 'roadmap') {
      const roadmap = await topicService.createRoadmap({
        title, 
        description, 
        weight: weight || 1, 
        status: status || 'pending'
      }, req.user._id);
      
      return successResponse(res, 201, 'Roadmap successfully created', roadmap);
    }

    const topic = new Topic({
      type,
      title,
      description,
      parentId,
      ownerId: req.user._id,
      weight: weight || 1,
      status: status || 'pending'
    });
    
    await topic.save();
    
    return successResponse(res, 201, 'Topic successfully created', topic);
  } catch (error) {
    return errorResponse(res, 500, 'An error occurred while creating topic', error);
  }
};

/**
 * Controller function that updates an existing topic or roadmap
 * 
 * @async
 * @function updateTopic
 * @param {object} req - Express request object
 * @param {object} req.params - Request parameters
 * @param {string} req.params.id - Topic ID to update
 * @param {object} req.body - Request body with fields to update
 * @param {string} [req.body.title] - Updated topic title
 * @param {string} [req.body.description] - Updated topic description
 * @param {number} [req.body.progress] - Updated progress value
 * @param {number} [req.body.weight] - Updated weight/order
 * @param {string} [req.body.status] - Updated status
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 with the updated topic
 * @throws {Error} - Returns 404 if topic not found, 500 for server errors
 * @description Updates an existing topic or roadmap for the authenticated user
 * @route PUT /topics/:id
 */
exports.updateTopic = async (req, res) => { // To-do: implement it (use)
  try {
    const topicId = req.params.id;
    const updateData = req.body;
    const userId = req.user._id;

    const topic = await Topic.findOne({ _id: topicId, ownerId: userId });
    
    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    if (topic.type === 'roadmap') {
      const updatedRoadmap = await topicService.updateRoadmap(topicId, updateData, userId);
      return successResponse(res, 200, 'Roadmap successfully updated', updatedRoadmap);
    }
    
    // To-do: update - refactor
    if (updateData.title) topic.title = updateData.title;
    if (updateData.description) topic.description = updateData.description;
    if (updateData.progress !== undefined) topic.progress = updateData.progress;
    if (updateData.weight !== undefined) topic.weight = updateData.weight;
    if (updateData.status) topic.status = updateData.status;

    await topic.save();
    
    return successResponse(res, 200, 'Topic successfully updated', topic);
  } catch (error) {
    return errorResponse(res, 500, 'An error occurred while updating topic', error);
  }
};

/**
 * Controller function that deletes a topic or roadmap
 * 
 * @async
 * @function deleteTopic
 * @param {object} req - Express request object
 * @param {object} req.params - Request parameters
 * @param {string} req.params.id - Topic ID to delete
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 on successful deletion
 * @throws {Error} - Returns 404 if topic not found, 500 for server errors
 * @description Deletes a topic or roadmap and its subtopics for the authenticated user
 * @route DELETE /topics/:id
 */
exports.deleteTopic = async (req, res) => { // To-do: implement it (use)
  try {
    const topicId = req.params.id;
    const userId = req.user._id;

    const topic = await Topic.findOne({ _id: topicId, ownerId: userId });
    
    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    if (topic.type === 'roadmap') {
      await topicService.deleteRoadmap(topicId, userId);
      return successResponse(res, 200, 'Roadmap successfully deleted');
    }

    // Delete subtopics too
    await Topic.deleteMany({ parentId: topicId });
    
    await Topic.deleteOne({ _id: topicId });
    
    return successResponse(res, 200, 'Topic successfully deleted');
  } catch (error) {
    return errorResponse(res, 500, 'An error occurred while deleting topic', error);
  }
};

/**
 * Controller function that retrieves child topics for a parent topic
 * 
 * @async
 * @function getChildTopics
 * @param {object} req - Express request object
 * @param {object} req.params - Request parameters
 * @param {string} req.params.id - Parent topic ID
 * @param {object} req.user - User object attached by authentication middleware
 * @param {object} res - Express response object
 * @returns {Promise<void>} - Returns status 200 with child topics
 * @throws {Error} - Returns 404 if parent topic not found, 500 for server errors
 * @description Fetches all child topics for a given parent topic or roadmap
 * @route GET /topics/:id/children
 */
exports.getChildTopics = async (req, res) => { // To-do: implement it (use) - instead send seperate request for roadmap subtopics
  try {
    const topicId = req.params.id;
    const userId = req.user._id;
    const topic = await Topic.findOne({ _id: topicId, ownerId: userId });
    
    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    if (topic.type === 'roadmap') {
      const subtopics = await topicService.getRoadmapSubtopics(topicId, userId);
      return successResponse(res, 200, 'Roadmap subtopics successfully retrieved', subtopics);
    }

    const childTopics = await Topic.find({ parentId: topicId, ownerId: userId });
    return successResponse(res, 200, 'Child topics successfully retrieved', childTopics);
  } catch (error) {
    return errorResponse(res, 500, 'An error occurred while retrieving child topics', error);
  }
}; 