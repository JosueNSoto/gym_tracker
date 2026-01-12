<template>
  <div>
    <h1 class="heading-1">El límite lo pones tú. 🤠</h1>

    <!-- GitHub Style Heatmap -->
    <section class="card-container !p-3 lg:!p-4">
      <h2 class="heading-2">Consistencia</h2>
      
      <!-- Contenedor con scroll horizontal en móvil y tablet, visible en desktop -->
      <div class="overflow-x-auto min-[820px]:overflow-visible -mx-3 px-3 min-[820px]:mx-0 min-[820px]:px-0">
        <div class="min-w-max min-[820px]:min-w-0 min-[820px]:w-full">
          
          <div class="flex gap-1 min-[820px]:gap-2">
            <!-- Day Labels (con espacio arriba para month labels) -->
            <div class="flex flex-col flex-shrink-0 w-6">
              <!-- Espacio para alinear con month labels -->
              <div class="h-4 mb-1"></div>
              <!-- Day labels -->
              <div class="flex flex-col gap-1 text-[10px] text-mulled-wine-300 pt-[2px]">
                <span class="h-3"></span> <!-- Sun -->
                <span class="h-3 leading-3">Lun</span>
                <span class="h-3"></span> <!-- Tue -->
                <span class="h-3 leading-3">Mie</span>
                <span class="h-3"></span> <!-- Thu -->
                <span class="h-3 leading-3">Vie</span>
                <span class="h-3"></span> <!-- Sat -->
              </div>
            </div>
            
            <!-- Calendar con Month Labels integradas -->
            <div class="flex-1 flex flex-col">
              <!-- Month Labels - DENTRO del mismo contenedor -->
              <div class="flex h-4 mb-1 text-[10px] text-mulled-wine-300 gap-1 min-[820px]:gap-0.5 lg:gap-2">
                <div 
                  v-for="(week, wIndex) in heatmapData" 
                  :key="'month-' + wIndex"
                  class="heatmap-week-label"
                >
                  <span v-if="getMonthLabel(week)" class="whitespace-nowrap">
                    {{ getMonthLabel(week) }}
                  </span>
                </div>
              </div>
              
              <!-- Calendar Grid - Flex en móvil/tablet, Grid en desktop (>=1024px) -->
              <div class="flex min-[820px]:grid gap-1 min-[820px]:gap-0.5 lg:gap-2" :style="isDesktop ? `grid-template-columns: repeat(${heatmapData.length}, minmax(0, 1fr));` : ''">
                <div v-for="(week, wIndex) in heatmapData" :key="wIndex" class="heatmap-week">
                  <div 
                    v-for="(day, dIndex) in week" 
                    :key="dIndex" 
                    class="heatmap-cell relative group"
                    :class="{ 
                      'heatmap-cell-active': day.active, 
                      'bg-transparent': !day.isValid, 
                      'heatmap-cell-inactive': day.isValid && !day.active
                    }"
                  >
                    <!-- Tooltip -->
                    <div v-if="day.isValid" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-mulled-wine-700 border border-mulled-wine-500 text-mulled-wine-50 text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      {{ formatDateMX(day.dateObj) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Actividad Reciente -->
    <section class="mb-6">
      <h2 class="heading-2">Actividad Reciente</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-start sm:justify-between gap-4 overflow-x-auto">
        <SkeletonActivityButton v-for="i in 5" :key="i" class="flex-grow" />
      </div>
      
      <!-- Empty State -->
      <EmptyState 
        v-else-if="recentActivity.length === 0"
        icon="💤"
        description="No hay actividad reciente."
        container-class="py-6"
      />
      
      <!-- Data -->
      <div v-else class="flex justify-start sm:justify-between gap-4 overflow-x-auto">
        <button 
          v-for="(act, i) in recentActivity" 
          :key="i" 
          @click="$router.push(`/workout-detail/${act.id}`)"
          class="card-container !p-2 !mb-0 flex flex-col items-center justify-center gap-1 min-w-[100px] flex-shrink-0 flex-grow sm:min-w-[110px] md:min-w-[120px] min-h-[120px] max-h-[120px] shadow-sm card-hover"
        >
          <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-mulled-wine-500/20 rounded-full flex items-center justify-center font-bold text-mulled-wine-50 p-1">
            <MuscleIcon :muscle="act.muscle" />
          </div>
          <span class="text-[10px] sm:text-xs md:text-sm font-bold text-mulled-wine-300 uppercase truncate max-w-full px-1 text-center">{{ act.muscle }}</span>
          <p class="text-[10px] sm:text-xs text-mulled-wine-400 mt-0">{{ act.date }}</p>
          <p v-if="act.duration" class="hidden md:block text-[10px] md:text-xs text-mulled-wine-500 mt-0 font-medium">{{ act.duration }}</p>
        </button>
      </div>
    </section>

    <!-- Récords (Carrusel) -->
    <section class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="heading-2 !mb-0">Tus récords (Max carga)</h2>
        <router-link to="/records" class="text-link">Ver todos</router-link>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-between gap-4 overflow-x-auto snap-x">
        <div v-for="i in 5" :key="i" class="snap-center flex-shrink-0 flex-grow w-[100px] sm:w-[110px] md:w-[120px]">
          <SkeletonRecordCard />
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="records.length === 0" class="text-sm text-mulled-wine-300">Registra entrenamientos para ver tus récords.</div>
      
      <!-- Data -->
      <div v-else class="flex justify-between gap-4 overflow-x-auto snap-x">
        <div v-for="record in records" :key="record.name" class="snap-center flex-shrink-0 flex-grow w-[100px] sm:w-[110px] md:w-[120px]">
          <RecordCard 
            :name="record.name"
            :weight="record.weight"
            :date="record.date"
          />
        </div>
      </div>
    </section>

    <!-- Rutinas -->
    <section>
      <div class="flex justify-between items-center mb-3">
        <h2 class="heading-2 !mb-0">Tus rutinas</h2>
        <router-link to="/routines" class="text-link">Ver todas</router-link>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 gap-3">
        <SkeletonRoutineCard v-for="i in 4" :key="i" />
      </div>
      
      <!-- Empty State -->
      <EmptyState 
        v-else-if="routines.length === 0"
        icon="📋"
        title="Aún no tienes rutinas creadas."
        description="¡Crea la primera abajo!"
        container-class="py-8 border-dashed border-2"
      />

      <!-- Data -->
      <div v-else class="grid grid-cols-2 gap-3">
        <div 
          v-for="routine in routines" 
          :key="routine.id" 
          @click="$router.push(`/routines/${routine.id}`)"
          class="card-container !p-3 !mb-0 flex flex-col gap-2 card-hover"
        >
          <div class="w-8 h-8 bg-mulled-wine-500 text-mulled-wine-50 rounded-lg flex items-center justify-center font-bold p-1 text-xl">
             <span v-if="routine.custom_icon">{{ routine.custom_icon }}</span>
             <MuscleIcon v-else :muscle="routine.muscle_focus?.[0]" />
          </div>
          <p class="font-bold text-sm truncate">{{ routine.name }}</p>
          <span class="muscle-tag w-fit" v-if="routine.muscle_focus?.[0]">
            {{ routine.muscle_focus[0] }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import MuscleIcon from '../components/MuscleIcon.vue'
import RecordCard from '../components/RecordCard.vue'
import EmptyState from '../components/EmptyState.vue'
import SkeletonActivityButton from '../components/SkeletonActivityButton.vue'
import SkeletonRecordCard from '../components/SkeletonRecordCard.vue'
import SkeletonRoutineCard from '../components/SkeletonRoutineCard.vue'

const auth = useAuthStore()
const loading = ref(true)

// Detectar si es desktop (>= 820px, iPad Air breakpoint)
const isDesktop = ref(window.innerWidth >= 820)
window.addEventListener('resize', () => {
  isDesktop.value = window.innerWidth >= 820
})

// State
const workoutDates = ref(new Set())
const recentActivity = ref([])
const records = ref([])
const routines = ref([]) // Rutinas reales

onMounted(async () => {
  if (!auth.user) return

  try {
    loading.value = true
    
    // 1. Fetch Workouts para Heatmap
    const { data: workouts } = await supabase
      .from('workouts')
      .select('started_at, id')
      .eq('user_id', auth.user.id)
    
    workouts?.forEach(w => {
      // Crear fecha local basada en el string ISO (Supabase da UTC, pero al hacer new Date() JS lo convierte a local)
      const date = new Date(w.started_at)
      workoutDates.value.add(getLocalKey(date))
    })

    // 2. Fetch Actividad Reciente
    const { data: recentWorkouts } = await supabase
      .from('workouts')
      .select(`id, started_at, ended_at, workout_sets ( exercises ( muscle_group ) )`)
      .eq('user_id', auth.user.id)
      .order('started_at', { ascending: false })
      .limit(10) // Traemos un poco más para filtrar locales
    
    recentActivity.value = recentWorkouts
      ?.filter(w => w.workout_sets && w.workout_sets.length > 0) // Filtrar vacíos
      .slice(0, 5) // Quedarnos con 5
      .map(w => {
        const muscles = w.workout_sets.map(s => s.exercises?.muscle_group).filter(Boolean)
        const mode = muscles.sort((a,b) =>
          muscles.filter(v => v===a).length - muscles.filter(v => v===b).length
        ).pop()
        
        // Formatear fecha DD/MM/AA
        const date = new Date(w.started_at)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2)
        const formattedDate = `${day}/${month}/${year}`
        
        // Calcular duración si ended_at existe
        let duration = null
        if (w.ended_at) {
          const start = new Date(w.started_at)
          const end = new Date(w.ended_at)
          const diffMs = end - start
          const diffMins = Math.round(diffMs / 60000)
          
          if (diffMins >= 60) {
            const hours = Math.floor(diffMins / 60)
            const mins = diffMins % 60
            duration = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
          } else {
            duration = `${diffMins}m`
          }
        }
        
        return { 
          id: w.id, 
          muscle: mode || 'General',
          date: formattedDate,
          duration: duration
        }
      }) || []

    // 3. Fetch Récords (Cálculo 1RM Estimado: Peso * (1 + 0.0333 * reps))
    const { data: sets } = await supabase
      .from('workout_sets')
      .select('weight, reps, created_at, exercises(name)')
      .eq('weight_unit', 'kg')

    const best1RM = {}
    sets?.forEach(s => {
      if (!s.exercises) return
      const est1RM = Math.round(s.weight * (1 + 0.0333 * s.reps))
      const createdAt = new Date(s.created_at).getTime()
      
      if (!best1RM[s.exercises.name] || est1RM > best1RM[s.exercises.name].weight) {
        // Formatear fecha como DD/MM/AA
        const date = new Date(s.created_at)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2)
        const formattedDate = `${day}/${month}/${year}`
        
        best1RM[s.exercises.name] = {
          weight: est1RM,
          date: formattedDate,
          timestamp: createdAt
        }
      }
    })
    
    records.value = Object.entries(best1RM)
      .map(([name, data]) => ({ name, weight: data.weight, date: data.date, timestamp: data.timestamp }))
      .sort((a, b) => b.timestamp - a.timestamp) // Ordenar por fecha descendente (más nuevo primero)
      .slice(0, 5)

    // 4. Fetch Rutinas (Top 4 para el Dashboard)
    const { data: routinesData } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', auth.user.id)
      .limit(4)
    routines.value = routinesData || []

  } catch (e) {
    console.error('Dashboard Error:', e)
  } finally {
    loading.value = false
  }
})

// Heatmap Logic (Fixed Current Year)

// Helper para fecha local YYYY-MM-DD
const getLocalKey = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateMX = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const heatmapData = computed(() => {
  const weeks = []
  const today = new Date()
  today.setHours(0,0,0,0)
  
  const currentYear = today.getFullYear() // 2026

  // 1. Configurar límites exactos del AÑO ACTUAL
  const startOfYear = new Date(currentYear, 0, 1) // 1 Enero
  const endOfYear = new Date(currentYear, 11, 31) // 31 Diciembre

  // 2. Ajustar inicio al Domingo previo (para la primera columna)
  const startDate = new Date(startOfYear)
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1)
  }

  // 3. Ajustar fin al Sábado siguiente (para cerrar la última columna)
  const finalDate = new Date(endOfYear)
  while (finalDate.getDay() !== 6) {
    finalDate.setDate(finalDate.getDate() + 1)
  }

  let currentDate = new Date(startDate)

  // 4. Generar Grid
  while (currentDate <= finalDate) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const key = getLocalKey(currentDate)
      
      // Validaciones de visualización
      const isCurrentYear = currentDate.getFullYear() === currentYear
      const isFuture = currentDate > today
      
      week.push({
        dateObj: new Date(currentDate),
        date: key,
        active: workoutDates.value.has(key),
        // isValid controla si se muestra el cuadrito o es "invisible" (relleno de otro año)
        isValid: isCurrentYear, 
        isFuture: isFuture
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }
  
  return weeks
})

// Helper para obtener la etiqueta del mes si la semana contiene el día 1
const getMonthLabel = (week) => {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  for (const day of week) {
    if (day.isValid && day.dateObj.getDate() === 1) {
      return monthNames[day.dateObj.getMonth()]
    }
  }
  return null
}
</script>
