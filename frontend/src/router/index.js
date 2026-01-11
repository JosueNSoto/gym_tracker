import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/routines',
      name: 'routines',
      component: () => import('../views/RoutinesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/routines/:id',
      name: 'routine-detail',
      component: () => import('../views/RoutineDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/workout/:id',
      name: 'workout',
      component: () => import('../views/WorkoutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/workout-detail/:id',
      name: 'workout-detail',
      component: () => import('../views/WorkoutDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/records',
      name: 'records',
      component: () => import('../views/RecordsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user && auth.loading) {
    await auth.initialize()
  }
  
  if (to.meta.requiresAuth && !auth.user) {
    next('/auth')
  } else if (to.path === '/auth' && auth.user) {
    next('/')
  } else {
    next()
  }
})

export default router
