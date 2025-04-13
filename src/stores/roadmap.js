/**
 * Roadmap Store Module
 * 
 * @module stores/roadmap
 * @description Pinia store for managing roadmap data and related operations.
 * Handles state management for roadmaps including fetching, creating, updating, and deleting.
 */

import { defineStore } from 'pinia';
import apiClient, { topicService } from '../utils/api';

/**
 * Roadmap store definition using Pinia
 * 
 * @typedef {Object} RoadmapState
 * @property {Array<Object>} roadmaps - Array of roadmap objects
 * @property {boolean} loading - Loading state indicator
 * @property {Object|null} error - Error information if any
 */

/**
 * Roadmap store
 * 
 * @type {import('pinia').Store<'roadmap', RoadmapState>}
 */
export const useRoadmapStore = defineStore('roadmap', {
  /**
   * Store state
   * 
   * @returns {RoadmapState} Initial state for the store
   */
  state: () => ({
    roadmaps: [],
    loading: false,
    error: null
  }),

  /**
   * Store getters
   * 
   * @property {Function} getRoadmaps - Returns all roadmaps
   * @property {Function} isLoading - Returns loading state
   * @property {Function} getError - Returns error information
   */
  getters: {
    getRoadmaps: (state) => state.roadmaps,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  /**
   * Store actions for async operations and state mutations
   */
  actions: {
    /**
     * Fetch all roadmaps for the current user
     * 
     * @async
     * @function fetchRoadmaps
     * @returns {Promise<void>} 
     * @throws {Error} When roadmap retrieval fails
     */
    async fetchRoadmaps() {
      this.loading = true;
      this.error = null;
      try {
        const response = await topicService.getUserRoadmaps();
        this.roadmaps = response.data.roadmaps || [];
      } catch (error) {
        this.error = error.response?.data?.message || 'Error fetching roadmaps';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a new roadmap with topics and subtopics
     * 
     * @async
     * @function createRoadmap
     * @param {Object} roadmapData - Roadmap creation data
     * @param {string} roadmapData.title - Roadmap title
     * @param {string} roadmapData.description - Roadmap description
     * @param {Array<Object>} [roadmapData.topics] - Topics for the roadmap
     * @returns {Promise<Object>} Created roadmap data
     * @throws {Error} When roadmap creation fails
     */
    async createRoadmap(roadmapData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await topicService.createRoadmap(roadmapData);
        const newRoadmap = response.data;

        if (newRoadmap) {
          this.roadmaps.push(newRoadmap);
        }
        
        return newRoadmap;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error creating roadmap';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update an existing roadmap
     * 
     * @async
     * @function updateRoadmap
     * @param {string} id - Roadmap ID to update
     * @param {Object} updateData - Update data
     * @param {string} [updateData.title] - Updated title
     * @param {string} [updateData.description] - Updated description
     * @param {Array<Object>} [updateData.topics] - Updated topics
     * @returns {Promise<Object>} Updated roadmap data
     * @throws {Error} When roadmap update fails
     */
    async updateRoadmap(id, updateData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await topicService.updateRoadmap(id, updateData);
        const updatedRoadmap = response.data;

        if (updatedRoadmap) {
          const index = this.roadmaps.findIndex(r => r._id === id);
          if (index !== -1) {
            this.roadmaps[index] = updatedRoadmap;
          }
        }
        
        return updatedRoadmap;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error updating roadmap';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a roadmap
     * 
     * @async
     * @function deleteRoadmap
     * @param {string} id - Roadmap ID to delete
     * @returns {Promise<void>}
     * @throws {Error} When roadmap deletion fails
     */
    async deleteRoadmap(id) {
      this.loading = true;
      this.error = null;
      try {
        await topicService.deleteRoadmap(id);
        this.roadmaps = this.roadmaps.filter(r => r._id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error deleting roadmap';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 