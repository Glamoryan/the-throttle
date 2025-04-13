<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService, topicService } from '../utils/api';
import '@/assets/scss/pages/_dashboard.scss';

const router = useRouter();
const user = ref(null);
const roadmaps = ref([]);
const roadmapSubtopics = ref({});
const nestedSubtopics = ref({});
const expandedTopics = ref({});
const isLoading = ref(true);
const errorMessage = ref('');

const fetchUserRoadmaps = async () => {
  try {
    // Let's activate the API call
    const response = await topicService.getUserRoadmaps();
    console.log('Roadmaps data:', response.data); // For debugging
    return response.data.roadmaps || [];
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    // Just log the error, don't display error message
    return [];
  }
};

const fetchRoadmapSubtopics = async (roadmapId) => {
  try {
    const response = await topicService.getRoadmapSubtopics(roadmapId);
    console.log(`Alt konular alındı (${roadmapId}):`, response.data);
    // API'den gelen yanıtın doğru şekilde işlenmesi
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching subtopics for roadmap ${roadmapId}:`, error);
    return [];
  }
};

const fetchNestedSubtopics = async (parentId) => {
  try {
    const response = await topicService.getRoadmapSubtopics(parentId);
    console.log(`İç alt konular alındı (${parentId}):`, response.data);
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching nested subtopics for parent ${parentId}:`, error);
    return [];
  }
};

const loadDashboardData = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // Get user information
    const profileResponse = await authService.getUserProfile();
    user.value = profileResponse.data.user;
    
    // Get roadmap data
    roadmaps.value = await fetchUserRoadmaps();
    console.log('Yol haritaları yüklendi:', roadmaps.value.length);
    
    // Get subtopics for each roadmap
    roadmapSubtopics.value = {}; // Her yenileme öncesi temizle
    nestedSubtopics.value = {}; // İç içe alt konuları temizle
    
    // Tüm roadmap'ler için alt konuları getir
    if (roadmaps.value.length > 0) {
      const subtopicsPromises = roadmaps.value.map(async (roadmap) => {
        const subtopics = await fetchRoadmapSubtopics(roadmap._id);
        roadmapSubtopics.value[roadmap._id] = subtopics;
        console.log(`${roadmap.title} yol haritası için ${subtopics.length} alt konu yüklendi`);
        
        // Her alt konu için iç içe alt konuları getir
        if (subtopics.length > 0) {
          const nestedPromises = subtopics.map(async (topic) => {
            const nested = await fetchNestedSubtopics(topic._id);
            if (nested.length > 0) {
              if (!nestedSubtopics.value[roadmap._id]) {
                nestedSubtopics.value[roadmap._id] = {};
              }
              nestedSubtopics.value[roadmap._id][topic._id] = nested;
              console.log(`${topic.title} alt konusu için ${nested.length} iç alt konu yüklendi`);
            }
          });
          
          await Promise.all(nestedPromises);
        }
      });
      
      await Promise.all(subtopicsPromises);
    }
    
    console.log('Tüm veriler başarıyla yüklendi');

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Only show error message for critical errors
    if (error.response?.status === 401) {
      errorMessage.value = 'Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.';
      authService.logout();
      router.push('/login');
    } else {
      errorMessage.value = 'Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});

const reloadData = () => {
  loadDashboardData();
};

const toggleTopic = (roadmapId, topicId) => {
  if (!expandedTopics.value[roadmapId]) {
    expandedTopics.value[roadmapId] = {};
  }
  
  expandedTopics.value[roadmapId][topicId] = !expandedTopics.value[roadmapId][topicId];
};

const isTopicExpanded = (roadmapId, topicId) => {
  return expandedTopics.value[roadmapId]?.[topicId] || false;
};

const hasNestedSubtopics = (roadmapId, topicId) => {
  return nestedSubtopics.value[roadmapId]?.[topicId]?.length > 0 || false;
};

const getNestedCount = (roadmapId, topicId) => {
  return nestedSubtopics.value[roadmapId]?.[topicId]?.length || 0;
};

const overallProgress = computed(() => {
  if (!roadmaps.value || roadmaps.value.length === 0) return 0;
  const totalProgress = roadmaps.value.reduce((sum, map) => sum + (map.progress || 0), 0);
  return Math.round(totalProgress / roadmaps.value.length);
});

const lastUpdatedRoadmap = computed(() => {
  if (!roadmaps.value || roadmaps.value.length === 0) return null;
  return roadmaps.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
});

const getTopicCount = (roadmapId) => {
  return roadmapSubtopics.value[roadmapId]?.length || 0;
};

const getStatusTranslation = (status) => {
  const statusMap = {
    'pending': 'beklemede',
    'in-progress': 'devam ediyor',
    'done': 'tamamlandı'
  };
  
  return statusMap[status] || 'beklemede';
};

const logout = async () => {
  try {
    await authService.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const navigateToRoadmapDetail = (roadmapId) => {
  console.log("Navigating to roadmap:", roadmapId);
  router.push(`/roadmaps/${roadmapId}`);
};

const navigateToCreateRoadmap = () => {
  router.push('/roadmaps/create');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Kontrol Paneli</h1>
      <div class="header-actions">
        <button @click="reloadData" class="reload-button" title="Verileri yenile">
          <i class="fas fa-sync-alt"></i>
        </button>
        <button @click="logout" class="logout-button">
          <i class="fas fa-sign-out-alt"></i> Çıkış Yap
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>Kontrol paneli verileri yükleniyor...</p>
    </div>

    <div v-else-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <button @click="reloadData">Tekrar Dene</button>
    </div>

    <div v-else class="dashboard-content">
      <!-- Kullanıcı karşılama bölümü -->
      <section class="user-summary-section">
        <div class="welcome-message" v-if="user">
          <h2>Tekrar hoş geldin, {{ user.username }}!</h2>
        </div>
        <div class="overall-stats">
          <div class="stat-card">
            <h3>Toplam Yol Haritaları</h3>
            <p class="stat-value">{{ roadmaps.length }}</p>
          </div>
          
          <div class="stat-card">
            <h3>Genel İlerleme</h3>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: overallProgress + '%' }"></div>
            </div>
            <p class="stat-value">{{ overallProgress }}%</p>
          </div>
          
          <div class="stat-card" v-if="lastUpdatedRoadmap">
            <h3>Son Aktivite</h3>
            <p class="stat-value activity-text">
              {{ lastUpdatedRoadmap.title }} {{ formatDate(lastUpdatedRoadmap.updatedAt) }} tarihinde güncellendi
            </p>
          </div>
        </div>
      </section>

      <!-- Roadmap bölümü -->
      <section class="roadmaps-section">
        <div class="section-header">
          <h2>Yol Haritalarım</h2>
          <button @click="navigateToCreateRoadmap" class="create-roadmap-button">
            <i class="fas fa-plus"></i> Yeni Yol Haritası Oluştur
          </button>
        </div>

        <div v-if="roadmaps.length === 0" class="no-roadmaps">
          <p>Henüz bir yol haritası oluşturmadınız.</p>
          <button @click="navigateToCreateRoadmap">İlk yol haritanızı oluşturun</button>
        </div>

        <div v-else class="roadmap-list">
          <div
            v-for="roadmap in roadmaps"
            :key="roadmap._id"
            class="roadmap-card"
            @click="navigateToRoadmapDetail(roadmap._id)"
          >
            <div class="roadmap-card-header">
              <h3 class="roadmap-title">{{ roadmap.title }}</h3>
              <span :class="['status-badge', `status-${roadmap.status || 'pending'}`]">
                {{ getStatusTranslation(roadmap.status) }}
              </span>
            </div>
            
            <div class="roadmap-card-body">
              <p class="roadmap-description">{{ roadmap.description || 'Açıklama bulunmuyor.' }}</p>
              
              <div class="roadmap-progress">
                <span>İlerleme: {{ roadmap.progress || 0 }}%</span>
                <div class="progress-bar-container small">
                  <div class="progress-bar" :style="{ width: (roadmap.progress || 0) + '%' }"></div>
                </div>
              </div>
              
              <!-- Alt topicler bölümü -->
              <div v-if="roadmapSubtopics[roadmap._id] && roadmapSubtopics[roadmap._id].length > 0" class="roadmap-subtopics">
                <h4>Konular ({{ getTopicCount(roadmap._id) }})</h4>
                <div class="subtopics-list">
                  <div 
                    v-for="topic in roadmapSubtopics[roadmap._id]" 
                    :key="topic._id"
                    class="accordion-container"
                    @click.stop
                  >
                    <div 
                      class="accordion-header" 
                      @click="toggleTopic(roadmap._id, topic._id)"
                    >
                      <div :class="['accordion-title', { 'expanded': isTopicExpanded(roadmap._id, topic._id) }]">
                        <i class="fas fa-chevron-right toggle-icon"></i>
                        <span class="subtopic-title">{{ topic.title }}</span>
                        <span v-if="hasNestedSubtopics(roadmap._id, topic._id)" class="subtopic-count">
                          {{ getNestedCount(roadmap._id, topic._id) }}
                        </span>
                      </div>
                      <span :class="['status-badge', `status-${topic.status || 'pending'}`]">
                        {{ getStatusTranslation(topic.status) }}
                      </span>
                    </div>
                    
                    <div :class="['accordion-content', { 'expanded': isTopicExpanded(roadmap._id, topic._id) }]">
                      <div class="inner-content">
                        <div v-if="topic.description" class="subtopic-description">
                          {{ topic.description }}
                        </div>
                        
                        <div v-if="hasNestedSubtopics(roadmap._id, topic._id)" class="nested-subtopics">
                          <div 
                            v-for="subtask in nestedSubtopics[roadmap._id][topic._id]" 
                            :key="subtask._id"
                            class="subtopic-item"
                          >
                            <div class="subtopic-header">
                              <div class="subtopic-title-section">
                                <i class="fas fa-circle" style="font-size: 0.5rem"></i>
                                <span>{{ subtask.title }}</span>
                              </div>
                              <span :class="['status-badge', `status-${subtask.status || 'pending'}`]">
                                {{ getStatusTranslation(subtask.status) }}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div v-else-if="isTopicExpanded(roadmap._id, topic._id)" class="no-nested-subtopics">
                          <p>Alt görev bulunmuyor.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="roadmap-subtopics empty">
                <p>{{ isLoading ? 'Konular yükleniyor...' : 'Henüz konu eklenmemiş.' }}</p>
              </div>
            </div>
            
            <div class="roadmap-card-footer">
              <small>Son Güncelleme: {{ formatDate(roadmap.updatedAt) }}</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>