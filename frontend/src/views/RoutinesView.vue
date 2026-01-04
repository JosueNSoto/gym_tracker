<template>
  <div>
    <h1 class="heading-1">Tus Rutinas</h1>

    <!-- Botón Ejercicio Libre -->
    <section class="mb-6">
      <button 
        @click="router.push('/workout/free')"
        class="w-full btn-secondary flex items-center justify-center gap-2 py-4 border-dashed"
      >
        <span class="text-xl">+</span>
        <span>Entrenamiento Libre (Sin Rutina)</span>
      </button>
    </section>

    <!-- Lista de Rutinas -->
    <section>
      <div v-if="routines.length === 0" class="text-center py-10 text-gym-muted">
        <p>No tienes rutinas creadas.</p>
        <p class="text-sm mt-2">¡Crea la primera abajo!</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Tarjeta de Rutina -->
        <div 
          v-for="routine in routines" 
          :key="routine.id" 
          @click="openRoutine(routine.id)"
          class="card-container !p-4 flex flex-col gap-3 active:scale-95 transition-transform cursor-pointer hover:border-gym-primary"
        >
          <!-- Icono basado en el músculo -->
          <div 
            class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm"
            :class="getMuscleColor(routine.muscle_focus[0])"
          >
            {{ getMuscleIcon(routine.muscle_focus[0]) }}
          </div>
          
          <div>
            <h3 class="font-bold text-gym-dark leading-tight">{{ routine.name }}</h3>
            <p class="text-xs text-gym-muted mt-1 truncate">{{ routine.muscle_focus.join(', ') }}</p>
          </div>
        </div>

        <!-- Botón Crear Nueva Rutina -->
        <button 
          @click="createNewRoutine"
          class="card-container !p-4 flex flex-col gap-3 items-center justify-center bg-gray-50 border-dashed border-2 border-gray-300 active:bg-gray-100"
        >
          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            <span class="text-2xl font-bold">+</span>
          </div>
          <span class="text-sm font-bold text-gray-500">Nueva Rutina</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const routines = ref([])
const loading = ref(true)

const fetchRoutines = async () => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    routines.value = data
  } catch (e) {
    console.error('Error fetching routines:', e.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoutines()
})

const getMuscleIcon = (muscle) => {
// ... rest of the code remains same
  const map = {
    'Pecho': 'P', 'Espalda': 'E', 'Piernas': 'L', 'Brazos': 'B', 'Hombros': 'H'
  }
  return map[muscle] || 'G'
}

const getMuscleColor = (muscle) => {
  // Retorna clases de Tailwind dinámicas
  const map = {
    'Pecho': 'bg-red-100 text-red-600',
    'Espalda': 'bg-blue-100 text-blue-600',
    'Piernas': 'bg-orange-100 text-orange-600',
    'Brazos': 'bg-purple-100 text-purple-600'
  }
  return map[muscle] || 'bg-gray-100 text-gray-600'
}

const openRoutine = (id) => {
  router.push(`/routines/${id}`)
}

const createNewRoutine = () => {
  // Lógica para crear nueva (podría ir directo al detalle con ID 'new')
  router.push('/routines/new')
}
</script>
