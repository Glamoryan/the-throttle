<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../utils/api';

const router = useRouter();
const user = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');

onMounted(async () => {
  try {
    // Get user profile data from API
    const response = await authService.getUserProfile();
    user.value = response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    errorMessage.value = 'Failed to load user profile.';
    
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      authService.logout();
      router.push('/login');
    }
  } finally {
    isLoading.value = false;
  }
});

const logout = async () => {
  try {
    await authService.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <h1>Welcome to Dashboard</h1>
      
      <div v-if="isLoading" class="loading">
        Loading user data...
      </div>
      
      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-else-if="user" class="user-profile">
        <h2>User Profile</h2>
        <div class="profile-info">
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Account Created:</strong> {{ new Date(user.createdAt).toLocaleDateString() }}</p>
        </div>
      </div>
      
      <button @click="logout" class="logout-button">Logout</button>
    </div>
  </div>
</template>