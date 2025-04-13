/**
 * Vue Application Entry Point
 * 
 * @module main
 * @description Main entry point for the Vue.js application.
 * Initializes the application, sets up Pinia for state management,
 * configures the router, and mounts the application to the DOM.
 */

import './assets/scss/main.scss'
import '@fortawesome/fontawesome-free/css/all.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

/**
 * Create the Vue application instance
 * @constant {import('vue').App}
 */
const app = createApp(App)

/**
 * Create Pinia state management instance
 * @constant {import('pinia').Pinia}
 */
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')
