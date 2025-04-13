<template>
  <div class="roadmap-list">
    <div class="header">
      <h2>My Roadmaps</h2>
      <button @click="$router.push('/roadmaps/create')" class="btn-primary">
        <i class="fas fa-plus"></i> New Roadmap
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      <span class="loader"></span>
      Loading...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="roadmaps.length === 0" class="empty">
      You haven't created any roadmaps yet.
    </div>

    <div v-else class="roadmaps-grid">
      <div v-for="roadmap in roadmaps" :key="roadmap._id" class="roadmap-card">
        <div class="card-header">
          <h3>{{ roadmap.title }}</h3>
          <div class="actions">
            <button @click="$router.push(`/roadmaps/${roadmap._id}/edit`)" class="btn-icon">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="handleDelete(roadmap._id)" class="btn-icon delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <p class="description">{{ roadmap.description }}</p>
        
        <div class="progress-bar">
          <div :style="{ width: roadmap.progress + '%' }" class="progress"></div>
          <span class="progress-text">{{ roadmap.progress }}%</span>
        </div>
        
        <div class="card-footer">
          <span class="date">Created: {{ new Date(roadmap.createdAt).toLocaleDateString('en-US') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoadmapStore } from '@/stores/roadmap';
import { storeToRefs } from 'pinia';

const roadmapStore = useRoadmapStore();
const { roadmaps, isLoading, error } = storeToRefs(roadmapStore);

onMounted(async () => {
  try {
    await roadmapStore.fetchRoadmaps();
  } catch (err) {
    console.error('Error loading roadmaps:', err);
  }
});

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this roadmap?')) {
    return;
  }
  
  try {
    await roadmapStore.deleteRoadmap(id);
  } catch (err) {
    console.error('Error deleting roadmap:', err);
  }
};
</script> 