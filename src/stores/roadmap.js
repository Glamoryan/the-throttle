import { defineStore } from 'pinia';
import apiClient from '../utils/api';

export const useRoadmapStore = defineStore('roadmap', {
  state: () => ({
    roadmaps: [],
    loading: false,
    error: null
  }),

  getters: {
    getRoadmaps: (state) => state.roadmaps,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    // Tüm roadmap'leri getir
    async fetchRoadmaps() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/topics', {
          params: { type: 'roadmap' }
        });
        this.roadmaps = response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error fetching roadmaps';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Yeni roadmap oluştur
    async createRoadmap(roadmapData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.post('/topics', {
          ...roadmapData,
          type: 'roadmap'
        });
        this.roadmaps.push(response.data.data);
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error creating roadmap';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Roadmap güncelle
    async updateRoadmap(id, updateData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.put(`/topics/${id}`, updateData);
        const index = this.roadmaps.findIndex(r => r._id === id);
        if (index !== -1) {
          this.roadmaps[index] = response.data.data;
        }
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error updating roadmap';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Roadmap sil
    async deleteRoadmap(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiClient.delete(`/topics/${id}`);
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