<template>
  <div class="roadmap-list-container">
    <h1>Topluluk Yol Haritaları</h1>
    
    <div v-if="isLoading" class="loading-state">
      <p>Yol haritaları yükleniyor...</p>
    </div>
    
    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <button @click="fetchRoadmaps">Tekrar Dene</button>
    </div>
    
    <div v-else-if="roadmaps.length === 0" class="empty-state">
      <p>Henüz hiç yol haritası yok. İlk oluşturan siz olun!</p>
    </div>
    
    <div v-else class="roadmaps-grid">
      <div 
        v-for="roadmap in roadmaps" 
        :key="roadmap._id" 
        class="roadmap-card"
        @click="navigateToRoadmapDetail(roadmap._id)"
      >
        <h2 class="roadmap-title">{{ roadmap.title }}</h2>
        <p class="roadmap-description">
          {{ roadmap.description || 'Açıklama bulunmuyor' }}
        </p>
        <div class="roadmap-meta">
          <span class="roadmap-topics">
            {{ roadmap.topics?.length || 0 }} konu
          </span>
          <span class="roadmap-created">
            {{ formatDate(roadmap.createdAt) }} tarihinde oluşturuldu
          </span>
          <span class="roadmap-author" v-if="roadmap.author">
            {{ roadmap.author.username }} tarafından
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { topicService } from '../utils/api';

const router = useRouter();
const roadmaps = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

const fetchRoadmaps = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await topicService.getRoadmaps();
    roadmaps.value = response.data.roadmaps || [];
  } catch (error) {
    console.error('Yol haritaları yüklenirken hata:', error);
    errorMessage.value = 'Yol haritaları yüklenirken hata oluştu. Lütfen daha sonra tekrar deneyin.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchRoadmaps();
});

const navigateToRoadmapDetail = (id) => {
  router.push(`/roadmaps/${id}`);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });
};
</script> 