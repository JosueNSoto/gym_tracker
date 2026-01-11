<template>
  <div class="view-container">
    <!-- Menú Hamburguesa -->
    <HamburgerMenu v-if="!isAuthRoute && !isWorkoutRoute" />
    
    <router-view />
    
    <!-- Navigation Bar (Mobile First) -->
    <nav v-if="!isAuthRoute" class="fixed bottom-0 left-0 right-0 bg-mulled-wine-700 border-t border-mulled-wine-500 p-4 flex justify-around items-center z-50">
      <router-link to="/" class="flex flex-col items-center text-mulled-wine-300" active-class="text-mulled-wine-50">
        <span class="text-xs mt-1">Inicio</span>
      </router-link>
      <router-link to="/routines" class="flex flex-col items-center text-mulled-wine-300" active-class="text-mulled-wine-50">
        <span class="text-xs mt-1">Rutinas</span>
      </router-link>
      <button @click="$router.push('/workout/free')" class="bg-mulled-wine-500 p-3 rounded-full text-mulled-wine-50 -mt-10 shadow-lg hover:bg-mulled-wine-400 active:scale-90 transition-all">
        <span class="font-bold text-xl">+</span>
      </button>
      <router-link to="/history" class="flex flex-col items-center text-mulled-wine-300" active-class="text-mulled-wine-50">
        <span class="text-xs mt-1">Historial</span>
      </router-link>
      <router-link to="/records" class="flex flex-col items-center text-mulled-wine-300" active-class="text-mulled-wine-50">
        <span class="text-xs mt-1">Récords</span>
      </router-link>
    </nav>

    <!-- Sistema de Notificaciones Global -->
    <NotificationToast />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotificationToast from './components/NotificationToast.vue'
import HamburgerMenu from './components/HamburgerMenu.vue'

const route = useRoute()
const isAuthRoute = computed(() => route.path === '/auth')
const isWorkoutRoute = computed(() => route.path.startsWith('/workout'))
</script>

<style>
/* No scope as requested - using main.css */
</style>