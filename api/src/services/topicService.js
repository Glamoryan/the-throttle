const Topic = require('../models/Topic');
const { ApiError } = require('../utils/errorHandler');

/**
 * Topic Service
 * 
 * @class TopicService
 * @description Handles business logic for topics and roadmaps, including creation,
 * retrieval, updates, and deletion. Implements service layer pattern to separate
 * business logic from controllers and data access.
 */
class TopicService {
  /**
   * Get user's roadmaps
   * 
   * @async
   * @method getUserRoadmaps
   * @memberof TopicService
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of roadmaps belonging to the user
   * @throws {Error} - If database operation fails
   * @description Retrieves all roadmaps created by a specific user
   */
  async getUserRoadmaps(userId) {
    try {
      const roadmaps = await Topic.find({
        ownerId: userId,
        type: 'roadmap',
        parentId: null
      }).sort({ updatedAt: -1 });
      
      return roadmaps;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get all public roadmaps
   * 
   * @async
   * @method getAllRoadmaps
   * @memberof TopicService
   * @returns {Promise<Array>} - List of all public roadmaps
   * @throws {Error} - If database operation fails
   * @description Retrieves all public roadmaps from the database
   */
  async getAllRoadmaps() {
    try {
      const roadmaps = await Topic.find({
        type: 'roadmap',
        parentId: null,
        // isPublic: true // Currently all are public(true) by default
      })
      .sort({ updatedAt: -1 })
      .populate('ownerId', 'username');
      
      return roadmaps;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Create a new roadmap
   * 
   * @async
   * @method createRoadmap
   * @memberof TopicService
   * @param {Object} roadmapData - Roadmap data
   * @param {string} roadmapData.title - Roadmap title
   * @param {string} [roadmapData.description] - Roadmap description
   * @param {number} [roadmapData.weight] - Roadmap weight for sorting
   * @param {string} [roadmapData.status] - Roadmap status
   * @param {string} userId - User ID of the creator
   * @returns {Promise<Object>} - Created roadmap
   * @throws {Error} - If database operation fails
   * @description Creates a new roadmap with the provided data
   */
  async createRoadmap(roadmapData, userId) {
    try {
      const roadmap = new Topic({
        ...roadmapData,
        type: 'roadmap',
        ownerId: userId,
        parentId: null
      });
      
      await roadmap.save();
      return roadmap;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get a roadmap by ID
   * 
   * @async
   * @method getRoadmapById
   * @memberof TopicService
   * @param {string} roadmapId - Roadmap ID
   * @param {string} userId - User ID of the owner
   * @returns {Promise<Object>} - Roadmap object
   * @throws {ApiError} - 404 error if roadmap not found
   * @description Retrieves a specific roadmap by its ID for a specific user
   */
  async getRoadmapById(roadmapId, userId) {
    const roadmap = await Topic.findOne({
      _id: roadmapId,
      ownerId: userId,
      type: 'roadmap'
    });
    
    if (!roadmap) {
      throw new ApiError(404, 'Roadmap not found');
    }
    
    return roadmap;
  }
  
  /**
   * Update a roadmap
   * 
   * @async
   * @method updateRoadmap
   * @memberof TopicService
   * @param {string} roadmapId - Roadmap ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.title] - Updated title
   * @param {string} [updateData.description] - Updated description
   * @param {number} [updateData.progress] - Updated progress
   * @param {string} [updateData.status] - Updated status
   * @param {string} userId - User ID of the owner
   * @returns {Promise<Object>} - Updated roadmap
   * @throws {ApiError} - 404 error if roadmap not found
   * @description Updates a roadmap with the provided data
   */
  async updateRoadmap(roadmapId, updateData, userId) {
    const roadmap = await this.getRoadmapById(roadmapId, userId);

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        roadmap[key] = updateData[key];
      }
    });
    
    await roadmap.save();
    return roadmap;
  }
  
  /**
   * Delete a roadmap
   * 
   * @async
   * @method deleteRoadmap
   * @memberof TopicService
   * @param {string} roadmapId - Roadmap ID
   * @param {string} userId - User ID of the owner
   * @returns {Promise<boolean>} - True if deletion was successful
   * @throws {ApiError} - 404 error if roadmap not found
   * @description Deletes a roadmap and all its subtopics
   */
  async deleteRoadmap(roadmapId, userId) {
    const roadmap = await this.getRoadmapById(roadmapId, userId); // To-do: check if this is needed

    await Topic.deleteMany({ parentId: roadmapId });
    await Topic.deleteOne({ _id: roadmapId });

    return true;
  }
  
  /**
   * Get roadmap subtopics
   * 
   * @async
   * @method getRoadmapSubtopics
   * @memberof TopicService
   * @param {string} roadmapId - Roadmap ID
   * @param {string} userId - User ID of the owner
   * @returns {Promise<Array>} - List of subtopics
   * @throws {ApiError} - 404 error if roadmap not found
   * @description Retrieves all subtopics for a specific roadmap
   */
  async getRoadmapSubtopics(roadmapId, userId) {
    // First validate that the roadmap exists
    await this.getRoadmapById(roadmapId, userId);

    const subtopics = await Topic.find({
      parentId: roadmapId,
      ownerId: userId
    }).sort({ createdAt: 1 });
    
    return subtopics;
  }
}

module.exports = new TopicService(); 