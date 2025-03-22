<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../utils/api';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const register = async () => {
  // Form validation
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Call API register service
    await authService.register({
      username: name.value,
      email: email.value,
      password: password.value
    });
    
    // Redirect to dashboard or home page after successful registration
    // Here you can change the path to your main app page
    router.push('/dashboard');
  } catch (error) {
    console.error('Registration failed', error);
    // Handle API error response
    errorMessage.value = error.response?.data?.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Create Account</h1>
      
      <div class="form-group">
        <label for="name">Full Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="name" 
          placeholder="Your full name"
          autocomplete="name"
        >
      </div>
      
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
          autocomplete="new-password"
        >
      </div>
      
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input 
          type="password" 
          id="confirm-password" 
          v-model="confirmPassword" 
          placeholder="Confirm your password"
          autocomplete="new-password"
        >
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <button 
        class="register-button" 
        @click="register"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Creating account...' : 'Register' }}
      </button>
      
      <div class="login-link">
        Already have an account? 
        <a href="#" @click.prevent="goToLogin">Login</a>
      </div>
    </div>
  </div>
</template> 