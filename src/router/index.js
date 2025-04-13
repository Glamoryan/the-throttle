import { createRouter, createWebHistory } from 'vue-router'
import { useRouter } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import RoadmapListView from '../views/RoadmapListView.vue'
import RoadmapFormView from '../views/RoadmapFormView.vue'
import { authService } from '../utils/api'

// Auth guard to protect routes
const requireAuth = (to, from, next) => {
  if (!authService.isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
};

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Kimlik doğrulama kontrolü
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login')
  } else {
    next()
  }
})

export default router 