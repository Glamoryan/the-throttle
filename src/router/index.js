/**
 * Vue Router Configuration
 * 
 * @module router
 * @description Configures Vue Router with route definitions, navigation guards,
 * and authentication protection for the application.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useRouter } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import RoadmapListView from '../views/RoadmapListView.vue'
import RoadmapFormView from '../views/RoadmapFormView.vue'
import { authService } from '../utils/api'

/**
 * Navigation guard to protect routes requiring authentication
 * 
 * @function requireAuth
 * @param {object} to - Target route
 * @param {object} from - Current route
 * @param {function} next - Function to resolve the hook
 * @description Redirects to login page if user is not authenticated
 */
const requireAuth = (to, from, next) => {
  if (!authService.isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
};

/**
 * Application routes configuration
 * 
 * @constant {Array<Object>} routes
 * @description Defines all application routes with their components and guards
 */
const routes = [
  {
    path: '/',
    redirect: '/roadmaps'
  },
  {
    path: '/roadmaps',
    name: 'RoadmapList',
    component: RoadmapListView,
    beforeEnter: requireAuth
  },
  {
    path: '/roadmaps/create',
    name: 'RoadmapCreate',
    component: RoadmapFormView,
    beforeEnter: requireAuth
  },
  {
    path: '/roadmaps/:id/edit',
    name: 'RoadmapEdit',
    component: RoadmapFormView,
    beforeEnter: requireAuth
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    beforeEnter: requireAuth
  }
]

/**
 * Vue Router instance
 * 
 * @constant router
 * @type {import('vue-router').Router}
 * @description Creates and configures the Vue Router instance with history mode
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * Global navigation guard
 * 
 * @description Authentication check before each route navigation
 * Redirects to login page if user is not authenticated and trying to access a protected route
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login')
  } else {
    next()
  }
})

export default router 