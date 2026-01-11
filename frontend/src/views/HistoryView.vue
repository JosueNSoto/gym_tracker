<template>
  <div class="view-container">
    <h1 class="heading-1">Historial de Entrenamientos</h1>

    <!-- Loading State -->
    <div v-if="loading">
      <section class="mb-6">
        <div class="flex justify-start gap-4 overflow-x-auto">
          <div 
            v-for="i in 5" 
            :key="i"
            class="card-container !p-2 !mb-0 flex flex-col items-center justify-center gap-1 min-w-[100px] flex-shrink-0 sm:min-w-[110px] md:min-w-[120px] max-w-[120px] sm:max-w-[130px] md:max-w-[140px] min-h-[120px] max-h-[120px] shadow-sm"
          >
            <div class="skeleton-shimmer h-8 w-8 rounded-full mb-2"></div>
            <div class="skeleton-shimmer h-4 w-16 rounded"></div>
            <div class="skeleton-shimmer h-3 w-12 rounded"></div>
          </div>
        </div>
      </section>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="workouts.length === 0"
      icon="📅"
      title="No hay entrenamientos en el historial"
      description="Completa tu primer entrenamiento y aparecerá aquí."
    />

    <!-- Workouts Grid -->
    <div v-else>
      <section class="mb-6">
        <div class="flex justify-start gap-4 overflow-x-auto pb-2">
          <button
            v-for="workout in workouts"
            :key="workout.id"
            @click="goToWorkoutDetail(workout.id)"
            class="card-container !p-2 !mb-0 flex flex-col items-center justify-center gap-1 min-w-[100px] flex-shrink-0 sm:min-w-[110px] md:min-w-[120px] max-w-[120px] sm:max-w-[130px] md:max-w-[140px] min-h-[120px] max-h-[120px] shadow-sm card-hover"
          >
            <div class="w-12 h-12 bg-mulled-wine-500/20 rounded-xl flex items-center justify-center text-2xl mb-1">
              <MuscleIcon :muscle="workout.primary_muscle" />
            </div>
            <p class="text-xs font-bold text-mulled-wine-50 text-center leading-tight">
              {{ workout.title }}
            </p>
            <p class="text-xs text-mulled-wine-300">
              {{ formatShortDate(workout.started_at) }}
            </p>
          </button>
        </div>
      </section>

      <!-- Statistics Summary (opcional) -->
      <section class="card-container">
        <h2 class="heading-2">Resumen</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="bg-mulled-wine-700 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-mulled-wine-50">{{ workouts.length }}</p>
            <p class="text-xs text-mulled-wine-300 mt-1">Entrenamientos</p>
          </div>
          <div class="bg-mulled-wine-700 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-mulled-wine-50">{{ totalSets }}</p>
            <p class="text-xs text-mulled-wine-300 mt-1">Series Totales</p>
          </div>
          <div class="bg-mulled-wine-700 rounded-lg p-4 text-center">
            <p class="text-3xl font-bold text-mulled-wine-50">{{ totalVolume }}</p>
            <p class="text-xs text-mulled-wine-300 mt-1">Volumen (kg)</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import EmptyState from '../components/EmptyState.vue'
import MuscleIcon from '../components/MuscleIcon.vue'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const workouts = ref([])

onMounted(async () => {
  if (!auth.user) {
    router.push('/auth')
    return
  }

  try {
    loading.value = true

    // Obtener workouts completados del usuario (solo los que tengan ended_at)
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        id,
        started_at,
        ended_at,
        routines (
          name
        )
      `)
      .eq('user_id', auth.user.id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })

    if (workoutsError) throw workoutsError

    // Para cada workout, obtener información adicional
    const workoutsWithDetails = await Promise.all(
      (workoutsData || []).map(async (workout) => {
        // Obtener sets del workout para calcular estadísticas
        const { data: setsData } = await supabase
          .from('workout_sets')
          .select(`
            id,
            weight,
            weight_unit,
            reps,
            exercises (
              muscle_group
            )
          `)
          .eq('workout_id', workout.id)

        // Calcular músculo primario
        const muscles = (setsData || [])
          .map(s => s.exercises?.muscle_group)
          .filter(Boolean)

        const muscleFrequency = {}
        muscles.forEach(muscle => {
          muscleFrequency[muscle] = (muscleFrequency[muscle] || 0) + 1
        })

        const primaryMuscle = Object.keys(muscleFrequency).length > 0
          ? Object.keys(muscleFrequency).reduce((a, b) => 
              muscleFrequency[a] > muscleFrequency[b] ? a : b
            )
          : 'General'

        // Calcular volumen total
        const volume = (setsData || []).reduce((sum, set) => {
          const weight = set.weight_unit === 'kg' ? set.weight : set.weight * 0.453592
          return sum + (weight * set.reps)
        }, 0)

        return {
          ...workout,
          title: workout.routines?.name || 'Entrenamiento Libre',
          primary_muscle: primaryMuscle,
          total_sets: setsData?.length || 0,
          total_volume: volume
        }
      })
    )

    workouts.value = workoutsWithDetails

  } catch (e) {
    console.error('Error loading workouts history:', e)
  } finally {
    loading.value = false
  }
})

const formatShortDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

const goToWorkoutDetail = (workoutId) => {
  router.push(`/workout-detail/${workoutId}`)
}

const totalSets = computed(() => {
  return workouts.value.reduce((sum, w) => sum + w.total_sets, 0)
})

const totalVolume = computed(() => {
  return workouts.value.reduce((sum, w) => sum + w.total_volume, 0).toFixed(0)
})
</script>
