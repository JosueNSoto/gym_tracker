<template>
  <div class="view-container">
    <!-- Menú Hamburguesa -->
    <HamburgerMenu v-if="!isAuthRoute && !isWorkoutRoute" />
    
    <router-view />
    
    <!-- Navigation Bar (Mobile First) -->
    <nav v-if="!isAuthRoute" class="fixed bottom-0 left-0 right-0 bg-mulled-wine-700 border-t border-mulled-wine-500 p-4 flex justify-around items-center z-50">
      <!-- Liquid Glass Blob -->
      <div 
        ref="blobRef" 
        class="nav-blob"
        :style="blobStyle"
      ></div>
      
      <router-link 
        ref="homeRef"
        to="/" 
        class="flex flex-col items-center text-mulled-wine-300 relative z-10 transition-colors" 
        active-class="text-mulled-wine-50"
        @mouseenter="onHoverNav('home')"
        @mouseleave="onLeaveNav"
      >
        <span class="text-xs mt-1">Inicio</span>
      </router-link>
      <router-link 
        ref="routinesRef"
        to="/routines" 
        class="flex flex-col items-center text-mulled-wine-300 relative z-10 transition-colors" 
        active-class="text-mulled-wine-50"
        @mouseenter="onHoverNav('routines')"
        @mouseleave="onLeaveNav"
      >
        <span class="text-xs mt-1">Rutinas</span>
      </router-link>
      <button @click="openWorkoutMenu" class="bg-mulled-wine-500 p-3 rounded-full text-mulled-wine-50 -mt-10 shadow-lg hover:bg-mulled-wine-400 active:scale-90 transition-all relative z-10">
        <span class="font-bold text-xl">+</span>
      </button>
      <router-link 
        ref="historyRef"
        to="/history" 
        class="flex flex-col items-center text-mulled-wine-300 relative z-10 transition-colors" 
        active-class="text-mulled-wine-50"
        @mouseenter="onHoverNav('history')"
        @mouseleave="onLeaveNav"
      >
        <span class="text-xs mt-1">Historial</span>
      </router-link>
      <router-link 
        ref="recordsRef"
        to="/records" 
        class="flex flex-col items-center text-mulled-wine-300 relative z-10 transition-colors" 
        active-class="text-mulled-wine-50"
        @mouseenter="onHoverNav('records')"
        @mouseleave="onLeaveNav"
      >
        <span class="text-xs mt-1">Récords</span>
      </router-link>
    </nav>

    <!-- Sistema de Notificaciones Global -->
    <NotificationToast />

    <!-- Action Sheet: Menú de Inicio de Entrenamiento -->
    <div v-if="showWorkoutMenu" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" @click="closeWorkoutMenu">
      <div class="bg-mulled-wine-600 w-full max-w-md rounded-t-2xl p-4 animate-slide-up flex flex-col gap-2" @click.stop>
        <div class="w-12 h-1 bg-mulled-wine-500 rounded-full mx-auto mb-4"></div>
        <h3 class="text-center font-bold text-mulled-wine-50 mb-2">Iniciar Entrenamiento</h3>
        
        <button @click="startQuickWorkout" class="w-full py-3 bg-mulled-wine-700 rounded-xl font-semibold text-mulled-wine-50 hover:bg-mulled-wine-500 active:bg-mulled-wine-400 transition-colors flex items-center justify-center gap-2">
          <span>⚡</span>
          <span>Entrenamiento Rápido</span>
        </button>

        <button 
          v-if="routines.length > 0"
          @click="openRoutineSelector" 
          class="w-full py-3 bg-mulled-wine-700 rounded-xl font-semibold text-mulled-wine-50 hover:bg-mulled-wine-500 active:bg-mulled-wine-400 transition-colors flex items-center justify-center gap-2"
        >
          <span>📋</span>
          <span>Seleccionar Rutina</span>
        </button>

        <div v-else class="w-full py-3 bg-mulled-wine-700/50 rounded-xl text-center text-sm text-mulled-wine-400">
          No tienes rutinas creadas. ¡Crea una desde Rutinas!
        </div>
        
        <button @click="closeWorkoutMenu" class="w-full btn-cancel mt-2">
          Cancelar
        </button>
      </div>
    </div>

    <!-- Modal: Selector de Rutinas -->
    <div v-if="showRoutineSelector" class="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center p-0 backdrop-blur-sm transition-all" @click="closeRoutineSelector">
      <div class="bg-mulled-wine-600 w-full max-w-md h-[70vh] sm:h-[500px] rounded-t-2xl flex flex-col shadow-2xl animate-slide-up" @click.stop>
        
        <!-- Handle visual -->
        <div class="w-12 h-1 bg-mulled-wine-500 rounded-full mx-auto mt-4 mb-3"></div>
        
        <!-- Header -->
        <div class="px-4 pb-3 flex justify-between items-center">
          <h3 class="font-bold text-lg text-mulled-wine-50">Seleccionar Rutina</h3>
          <button @click="closeRoutineSelector" class="w-8 h-8 flex items-center justify-center rounded-full bg-mulled-wine-700 text-mulled-wine-300 hover:bg-mulled-wine-500 hover:text-mulled-wine-50 transition-colors active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Lista de Rutinas -->
        <div class="flex-1 overflow-y-auto px-3 pb-4">
          <div v-if="routines.length === 0" class="flex flex-col items-center justify-center h-40 text-mulled-wine-300">
            <span class="text-2xl mb-2">😕</span>
            <p class="text-sm">No tienes rutinas creadas.</p>
          </div>

          <div class="space-y-2">
            <div 
              v-for="routine in routines" 
              :key="routine.id"
              @click="selectRoutine(routine.id)"
              class="p-3 rounded-xl bg-mulled-wine-700 hover:bg-mulled-wine-500 active:bg-mulled-wine-400 cursor-pointer flex justify-between items-center group transition-all border border-mulled-wine-500 hover:border-mulled-wine-400"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-mulled-wine-600 flex items-center justify-center text-lg font-bold text-mulled-wine-300 group-hover:bg-mulled-wine-500 group-hover:text-mulled-wine-50 transition-all p-1">
                  <span v-if="routine.custom_icon">{{ routine.custom_icon }}</span>
                  <MuscleIcon v-else :muscle="routine.muscle_focus?.[0]" />
                </div>
                <div>
                  <p class="font-bold text-mulled-wine-50 text-sm">{{ routine.name }}</p>
                  <p class="text-[10px] text-mulled-wine-300 uppercase font-bold tracking-wider" v-if="routine.muscle_focus?.[0]">
                    {{ routine.muscle_focus[0] }}
                  </p>
                </div>
              </div>
              
              <span class="text-mulled-wine-400 group-hover:text-mulled-wine-50 transition-colors font-bold text-sm">
                →
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotificationToast from './components/NotificationToast.vue'
import HamburgerMenu from './components/HamburgerMenu.vue'
import MuscleIcon from './components/MuscleIcon.vue'
import { supabase } from './supabase'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isAuthRoute = computed(() => route.path === '/auth')
const isWorkoutRoute = computed(() => route.path.startsWith('/workout'))

// Estados para el menú del botón +
const showWorkoutMenu = ref(false)
const showRoutineSelector = ref(false)
const routines = ref([])

// Refs para el efecto Liquid Glass Blob
const blobRef = ref(null)
const homeRef = ref(null)
const routinesRef = ref(null)
const historyRef = ref(null)
const recordsRef = ref(null)

// Estado del blob
const blobStyle = ref({
  opacity: '0',
  transform: 'translate(0px, 0px)',
  width: '0px',
  height: '0px'
})

const isHovering = ref(false)

// Mapeo de rutas a refs
const routeToRef = {
  '/': 'homeRef',
  '/routines': 'routinesRef',
  '/history': 'historyRef',
  '/records': 'recordsRef'
}

// Función para actualizar la posición del blob
const updateBlobPosition = (targetRefName) => {
  nextTick(() => {
    const targetRef = targetRefName === 'homeRef' ? homeRef.value :
                      targetRefName === 'routinesRef' ? routinesRef.value :
                      targetRefName === 'historyRef' ? historyRef.value :
                      targetRefName === 'recordsRef' ? recordsRef.value : null

    if (!targetRef || !blobRef.value) return

    const targetEl = targetRef.$el || targetRef
    const navEl = blobRef.value.parentElement

    if (!targetEl || !navEl) return

    const targetRect = targetEl.getBoundingClientRect()
    const navRect = navEl.getBoundingClientRect()

    // Calcular posición relativa al nav - centrado sobre el botón
    const left = targetRect.left - navRect.left - 4
    const top = targetRect.top - navRect.top - 4

    blobStyle.value = {
      opacity: '1',
      transform: `translate(${left}px, ${top}px)`,
      width: `${targetRect.width + 8}px`,
      height: `${targetRect.height + 8}px`
    }
  })
}

// Watch para detectar cambios de ruta y mover el blob
watch(() => route.path, (newPath) => {
  if (isHovering.value) return // No actualizar si está en hover
  
  const refName = routeToRef[newPath]
  if (refName) {
    updateBlobPosition(refName)
  }
}, { immediate: true })

// Handlers para hover
const onHoverNav = (navName) => {
  isHovering.value = true
  const refName = `${navName}Ref`
  updateBlobPosition(refName)
}

const onLeaveNav = () => {
  isHovering.value = false
  // Volver a la ruta activa
  const refName = routeToRef[route.path]
  if (refName) {
    updateBlobPosition(refName)
  }
}

// Cargar rutinas del usuario
const loadRoutines = async () => {
  if (!auth.user) return
  
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    routines.value = data || []
  } catch (e) {
    console.error('Error loading routines:', e)
  }
}

onMounted(() => {
  loadRoutines()
  
  // Inicializar posición del blob después de que todo esté montado
  nextTick(() => {
    const refName = routeToRef[route.path]
    if (refName) {
      updateBlobPosition(refName)
    }
  })
})

// Funciones del menú
const openWorkoutMenu = () => {
  showWorkoutMenu.value = true
}

const closeWorkoutMenu = () => {
  showWorkoutMenu.value = false
}

const startQuickWorkout = () => {
  closeWorkoutMenu()
  router.push('/workout/free')
}

const openRoutineSelector = () => {
  closeWorkoutMenu()
  showRoutineSelector.value = true
}

const selectRoutine = (routineId) => {
  showRoutineSelector.value = false
  router.push(`/workout/${routineId}`)
}

const closeRoutineSelector = () => {
  showRoutineSelector.value = false
}
</script>

<style>
/* No scope as requested - using main.css */
</style>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>