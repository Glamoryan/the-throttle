<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../utils/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const login = async () => {
  // Form validation
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Call API login service
    await authService.login({
      email: email.value,
      password: password.value
    });
    
    // Redirect to dashboard or home page after successful login
    // Here you can change the path to your main app page
    router.push('/dashboard');
  } catch (error) {
    console.error('Login failed', error);
    errorMessage.value = error.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="Your email address"
          autocomplete="email"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Your password"
          autocomplete="current-password"
        >
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <button 
        class="login-button" 
        @click="login"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
      
      <div class="register-link">
        Don't have an account? 
        <a href="#" @click.prevent="goToRegister">Register</a>
      </div>
    </div>
  </div>
</template> 