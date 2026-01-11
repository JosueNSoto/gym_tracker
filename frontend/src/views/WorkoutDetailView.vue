<template>
  <div>
    <!-- Header con botón de regreso -->
    <div class="flex items-center gap-3 mb-6">
      <BackButton to="/" />
      <h1 class="heading-1 !mb-0">Detalle de Sesión</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-mulled-wine-400"></div>
    </div>

    <!-- Error State -->
    <EmptyState 
      v-else-if="error"
      icon="😕"
      title="No se pudo cargar la sesión"
      :description="error"
      container-class="py-12"
    />

    <!-- Workout Detail -->
    <div v-else-if="workout">
      <!-- Info Card -->
      <section class="card-container mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="heading-2 !mb-1">{{ workoutTitle }}</h2>
            <p class="text-sm text-mulled-wine-300">{{ formatDate(workout.started_at) }}</p>
          </div>
          <div class="w-12 h-12 bg-mulled-wine-500/20 rounded-xl flex items-center justify-center font-bold text-mulled-wine-50 p-1 text-2xl">
            <MuscleIcon :muscle="primaryMuscle" />
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-mulled-wine-700 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-mulled-wine-50">{{ duration }}</p>
            <p class="text-xs text-mulled-wine-300 mt-1">Duración</p>
          </div>
          <div class="bg-mulled-wine-700 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-mulled-wine-50">{{ totalSets }}</p>
            <p class="text-xs text-mulled-wine-300 mt-1">Series</p>
          </div>
          <div class="bg-mulled-wine-700 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-mulled-wine-50">{{ totalVolume }}</p>
            <p class="text-xs text-mulled-wine-300 mt-1">Volumen (kg)</p>
          </div>
        </div>
      </section>

      <!-- Exercises List -->
      <section class="card-container">
        <h3 class="heading-2">Ejercicios Realizados</h3>
        
        <EmptyState 
          v-if="groupedExercises.length === 0"
          icon="🏋️"
          description="No hay ejercicios registrados en esta sesión."
          container-class="py-8"
        />

        <div v-else class="space-y-4">
          <div 
            v-for="(exercise, idx) in groupedExercises" 
            :key="idx"
            class="bg-mulled-wine-700 rounded-xl p-4 border border-mulled-wine-500"
          >
            <!-- Exercise Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-bold text-mulled-wine-50 mb-1">{{ exercise.name }}</h4>
                <span class="muscle-tag">{{ exercise.muscle }}</span>
              </div>
              <div class="text-right">
                <p class="text-xs text-mulled-wine-300">{{ exercise.sets.length }} series</p>
              </div>
            </div>

            <!-- Sets Table -->
            <div class="space-y-2">
              <div 
                v-for="(set, setIdx) in exercise.sets" 
                :key="setIdx"
                class="flex items-center justify-between bg-mulled-wine-600 rounded-lg px-3 py-2 text-sm"
              >
                <span class="text-mulled-wine-300 font-semibold">Serie {{ setIdx + 1 }}</span>
                <div class="flex items-center gap-4">
                  <span class="text-mulled-wine-50 font-bold">{{ set.weight }} {{ set.weight_unit }}</span>
                  <span class="text-mulled-wine-300">×</span>
                  <span class="text-mulled-wine-50 font-bold">{{ set.reps }} reps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import BackButton from '../components/BackButton.vue'
import MuscleIcon from '../components/MuscleIcon.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const error = ref(null)
const workout = ref(null)
const workoutSets = ref([])

const workoutId = route.params.id

onMounted(async () => {
  if (!auth.user) {
    router.push('/auth')
    return
  }

  try {
    loading.value = true

    // Fetch workout con sus sets y ejercicios
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        routines (
          name
        )
      `)
      .eq('id', workoutId)
      .eq('user_id', auth.user.id)
      .single()

    if (workoutError) throw workoutError
    if (!workoutData) throw new Error('Sesión no encontrada')

    workout.value = workoutData

    // Fetch sets de este workout
    const { data: setsData, error: setsError } = await supabase
      .from('workout_sets')
      .select(`
        *,
        exercises (
          name,
          muscle_group
        )
      `)
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: true })

    if (setsError) throw setsError
    workoutSets.value = setsData || []

  } catch (e) {
    console.error('Error loading workout detail:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// Computed Properties
const workoutTitle = computed(() => {
  if (workout.value?.routines?.name) {
    return workout.value.routines.name
  }
  return 'Entrenamiento Libre'
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const duration = computed(() => {
  if (!workout.value?.started_at || !workout.value?.ended_at) return '--'
  
  const start = new Date(workout.value.started_at)
  const end = new Date(workout.value.ended_at)
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m`
  
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
})

const totalSets = computed(() => workoutSets.value.length)

const totalVolume = computed(() => {
  return workoutSets.value.reduce((sum, set) => {
    const weight = set.weight_unit === 'kg' ? set.weight : set.weight * 0.453592
    return sum + (weight * set.reps)
  }, 0).toFixed(0)
})

const primaryMuscle = computed(() => {
  if (workoutSets.value.length === 0) return 'General'
  
  const muscles = workoutSets.value
    .map(s => s.exercises?.muscle_group)
    .filter(Boolean)
  
  // Encontrar el músculo más frecuente
  const mode = muscles.sort((a, b) =>
    muscles.filter(v => v === a).length - muscles.filter(v => v === b).length
  ).pop()
  
  return mode || 'General'
})

const groupedExercises = computed(() => {
  const grouped = {}
  
  workoutSets.value.forEach(set => {
    if (!set.exercises) return
    
    const exerciseName = set.exercises.name
    if (!grouped[exerciseName]) {
      grouped[exerciseName] = {
        name: exerciseName,
        muscle: set.exercises.muscle_group,
        sets: []
      }
    }
    
    grouped[exerciseName].sets.push({
      weight: set.weight,
      weight_unit: set.weight_unit,
      reps: set.reps
    })
  })
  
  return Object.values(grouped)
})
</script>
