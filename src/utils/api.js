/**
 * API Service Module
 * 
 * @module utils/api
 * @description Provides API client configuration and service classes for 
 * authentication and data operations. Manages interceptors, error handling,
 * and connection to the backend server.
 */

import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

/**
 * Axios instance for API calls 
 * @constant {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

/**
 * Request interceptor for authentication and logging
 * Automatically adds the authentication token to requests if available
 */
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Request to ${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 * Handles authentication errors and redirects to login page when needed
 */
apiClient.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url} status: ${response.status}`);
    return response;
  },
  error => {
    console.error('Response error:', error.response || error);

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error, logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication service
 * @namespace
 */
export const authService = {
  /**
   * Register a new user
   * 
   * @async
   * @function register
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} Registration response data
   * @throws {Error} When registration fails
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Login a user
   * 
   * @async
   * @function login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Email address
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response data with user and token
   * @throws {Error} When login fails
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout the user
   * 
   * @function logout
   * @returns {Promise<Object>} Logout response
   * @description Removes user data from local storage and makes API call
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return apiClient.post('/auth/logout');
  },

  /**
   * Get the current user profile
   * 
   * @async
   * @function getUserProfile
   * @returns {Promise<Object>} User profile data
   * @throws {Error} When profile retrieval fails
   */
  async getUserProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * 
   * @function isAuthenticated
   * @returns {boolean} True if user has a valid token
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get the current user
   * 
   * @function getUser
   * @returns {Object|null} User object or null if not logged in
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

/**
 * Topic and roadmap service
 * @namespace
 */
export const topicService = {
  /**
   * Get user roadmaps
   * 
   * @async
   * @function getUserRoadmaps
   * @returns {Promise<Object>} User's roadmaps
   * @throws {Error} When roadmap retrieval fails
   */
  async getUserRoadmaps() {
    try {
      const response = await apiClient.get('/topics/roadmaps');
      return response.data;
    } catch (error) {
      console.error('Get roadmaps error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Get all roadmaps
   * 
   * @async
   * @function getRoadmaps
   * @returns {Promise<Object>} All available roadmaps
   * @throws {Error} When roadmap retrieval fails
   */
  async getRoadmaps() {
    try {
      const response = await apiClient.get('/topics/public/roadmaps');
      return response.data;
    } catch (error) {
      console.error('Get all roadmaps error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Create a new roadmap with topics and subtopics
   * 
   * @async
   * @function createRoadmap
   * @param {Object} roadmapData - Roadmap data
   * @param {string} roadmapData.title - Roadmap title
   * @param {string} roadmapData.description - Roadmap description
   * @param {Array<Object>} [roadmapData.topics] - Topics for the roadmap
   * @returns {Promise<Object>} Created roadmap data
   * @throws {Error} When roadmap creation fails
   */
  async createRoadmap(roadmapData) {
    try {
      // First create the main roadmap
      const roadmapPayload = {
        title: roadmapData.title,
        description: roadmapData.description,
        type: 'roadmap'
      };
      
      const response = await apiClient.post('/topics', roadmapPayload);
      const roadmap = response.data.data;
      
      // If there are topics, create subtopics for each one
      if (roadmapData.topics && roadmapData.topics.length > 0) {
        const topicPromises = roadmapData.topics.map(async (topic) => {
          // Create topic
          const topicPayload = {
            title: topic.title,
            description: topic.description,
            type: 'subtopic',
            parentId: roadmap._id
          };
          
          const topicResponse = await apiClient.post('/topics', topicPayload);
          const createdTopic = topicResponse.data.data;
          
          // Create subtopics if they exist
          if (topic.subtopics && topic.subtopics.length > 0) {
            const subtopicPromises = topic.subtopics.map(async (subtopic) => {
              const subtopicPayload = {
                title: subtopic.title,
                description: subtopic.description,
                type: 'task',
                parentId: createdTopic._id
              };
              
              return await apiClient.post('/topics', subtopicPayload);
            });
            
            await Promise.all(subtopicPromises);
          }
          
          return createdTopic;
        });
        
        await Promise.all(topicPromises);
      }
      
      return response.data;
    } catch (error) {
      console.error('Create roadmap error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Get roadmap by ID
   * 
   * @async
   * @function getRoadmapById
   * @param {string} roadmapId - Roadmap ID
   * @returns {Promise<Object>} Roadmap data
   * @throws {Error} When roadmap retrieval fails
   */
  async getRoadmapById(roadmapId) {
    try {
      const response = await apiClient.get(`/topics/${roadmapId}`);
      return response.data;
    } catch (error) {
      console.error('Get roadmap error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Update a roadmap with its topics and subtopics
   * 
   * @async
   * @function updateRoadmap
   * @param {string} roadmapId - Roadmap ID to update
   * @param {Object} updateData - Update data
   * @param {string} updateData.title - Updated title
   * @param {string} updateData.description - Updated description
   * @param {number} [updateData.progress] - Updated progress
   * @param {Array<Object>} [updateData.topics] - Updated topics
   * @returns {Promise<Object>} Updated roadmap data
   * @throws {Error} When roadmap update fails
   */
  async updateRoadmap(roadmapId, updateData) {
    try {
      // First update the roadmap
      const roadmapPayload = {
        title: updateData.title,
        description: updateData.description,
        progress: updateData.progress || 0
      };
      
      const response = await apiClient.put(`/topics/${roadmapId}`, roadmapPayload);
      
      // Delete existing subtopics
      const existingTopics = await this.getRoadmapSubtopics(roadmapId);
      
      if (existingTopics && existingTopics.data) {
        // Delete each subtopic
        for (const topic of existingTopics.data) {
          // First delete sub-subtopics
          const subTopics = await this.getRoadmapSubtopics(topic._id);
          if (subTopics && subTopics.data) {
            for (const subTopic of subTopics.data) {
              await apiClient.delete(`/topics/${subTopic._id}`); // To-do: The deleteRoadmap function can be used instead of this
            }
          }
          
          // Then delete the topic
          await apiClient.delete(`/topics/${topic._id}`); // To-do: The deleteRoadmap function can be used instead of this
        }
      }
      
      // Add new topics
      if (updateData.topics && updateData.topics.length > 0) {
        const topicPromises = updateData.topics.map(async (topic) => {
          // Create topic
          const topicPayload = {
            title: topic.title,
            description: topic.description,
            type: 'subtopic',
            parentId: roadmapId
          };
          
          const topicResponse = await apiClient.post('/topics', topicPayload);
          const createdTopic = topicResponse.data.data;
          
          // Create subtopics if they exist
          if (topic.subtopics && topic.subtopics.length > 0) {
            const subtopicPromises = topic.subtopics.map(async (subtopic) => {
              const subtopicPayload = {
                title: subtopic.title || 'Untitled',
                description: subtopic.description || '',
                type: 'task',
                parentId: createdTopic._id
              };
              
              return await apiClient.post('/topics', subtopicPayload); // To-do: The createRoadmap function can be used instead of this
            });
            
            await Promise.all(subtopicPromises);
          }
          
          return createdTopic;
        });
        
        await Promise.all(topicPromises);
      }
      
      return response.data;
    } catch (error) {
      console.error('Update roadmap error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Delete a roadmap
   * 
   * @async
   * @function deleteRoadmap
   * @param {string} roadmapId - Roadmap ID to delete
   * @returns {Promise<Object>} Deletion response
   * @throws {Error} When roadmap deletion fails
   */
  async deleteRoadmap(roadmapId) {
    try {
      const response = await apiClient.delete(`/topics/${roadmapId}`);
      return response.data;
    } catch (error) {
      console.error('Delete roadmap error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Get subtopics for a roadmap or topic
   * 
   * @async
   * @function getRoadmapSubtopics
   * @param {string} roadmapId - Parent roadmap/topic ID
   * @returns {Promise<Object>} Subtopics data
   * @throws {Error} When subtopics retrieval fails
   */
  async getRoadmapSubtopics(roadmapId) {
    try {
      const response = await apiClient.get(`/topics/${roadmapId}/subtopics`);
      return response.data;
    } catch (error) {
      console.error('Get subtopics error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default apiClient; 