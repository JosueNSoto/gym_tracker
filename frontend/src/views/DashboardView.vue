<template>
  <div>
    <h1 class="heading-1">Hola, el límite lo pones tú. 🤠</h1>

    <!-- GitHub Style Heatmap -->
    <section class="card-container overflow-x-auto">
      <h2 class="heading-2">Consistencia</h2>
      <div class="flex flex-col min-w-max">
        
        <!-- Month Labels (Positioned Absolute-ish) -->
        <div class="flex relative h-4 mb-1 ml-8 text-[10px] text-gym-muted">
          <div 
            v-for="(label, i) in monthLabels" 
            :key="label.name + i" 
            class="absolute top-0"
            :style="{ left: `${label.index * 16}px` }"
          >
            {{ label.name }}
          </div>
        </div>

        <div class="flex gap-1">
          <!-- Day Labels -->
          <div class="flex flex-col gap-1 text-[10px] text-gym-muted pr-2 pt-[2px]">
            <span class="h-3"></span> <!-- Sun -->
            <span class="h-3 leading-3">Lun</span>
            <span class="h-3"></span> <!-- Tue -->
            <span class="h-3 leading-3">Mie</span>
            <span class="h-3"></span> <!-- Thu -->
            <span class="h-3 leading-3">Vie</span>
            <span class="h-3"></span> <!-- Sat -->
          </div>
          
          <!-- Calendar Grid -->
          <div class="flex gap-1">
            <div v-for="(week, wIndex) in heatmapData" :key="wIndex" class="flex flex-col gap-1 w-3">
              <div 
                v-for="(day, dIndex) in week" 
                :key="dIndex" 
                class="heatmap-cell relative group"
                :class="{ 
                  'heatmap-cell-active': day.active, 
                  'bg-transparent': !day.isValid, 
                  'bg-gray-200': day.isValid && !day.active
                }"
              >
                <!-- Tooltip -->
                <div v-if="day.isValid" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gym-dark text-white text-[10px] p-1 rounded whitespace-nowrap z-50 pointer-events-none">
                  {{ formatDateMX(day.dateObj) }}
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
      <div v-if="recentActivity.length === 0" class="text-sm text-gym-muted">No hay actividad reciente.</div>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div v-for="(act, i) in recentActivity" :key="i" class="min-w-[80px] h-20 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center shadow-sm">
          <div class="w-10 h-10 bg-gym-primary/10 rounded-full flex items-center justify-center mb-1 font-bold text-gym-primary">
            {{ getMuscleIcon(act.muscle) }}
          </div>
          <span class="text-[10px] font-bold text-gym-muted uppercase truncate max-w-full px-1">{{ act.muscle }}</span>
        </div>
      </div>
    </section>

    <!-- Récords (Carrusel) -->
    <section class="mb-6">
      <h2 class="heading-2">Tus récords (Max carga)</h2>
      <div v-if="records.length === 0" class="text-sm text-gym-muted">Registra entrenamientos para ver tus récords.</div>
      <div class="flex gap-4 overflow-x-auto pb-4 snap-x">
        <div v-for="record in records" :key="record.name" class="min-w-[160px] snap-center card-container !mb-0 border-l-4 border-l-gym-accent">
          <p class="text-label truncate">{{ record.name }}</p>
          <p class="text-2xl font-black text-gym-dark">{{ record.weight }} <span class="text-xs font-normal">kg</span></p>
        </div>
      </div>
    </section>

    <!-- Botón Ejercicio Libre -->
    <section class="mb-6">
      <button 
        @click="$router.push('/workout/free')"
        class="w-full btn-secondary flex items-center justify-center gap-2 py-4 border-dashed border-2"
      >
        <span class="text-xl">⚡</span>
        <span class="font-bold">Iniciar Entrenamiento Libre</span>
      </button>
    </section>

    <!-- Rutinas -->
    <section>
      <div class="flex justify-between items-center mb-3">
        <h2 class="heading-2 !mb-0">Tus rutinas</h2>
        <router-link to="/routines" class="text-gym-primary text-sm font-bold">Ver todas</router-link>
      </div>
      
      <div v-if="routines.length === 0" class="card-container p-8 text-center text-gym-muted border-dashed border-2">
        <p class="text-sm">Aún no tienes rutinas creadas.</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="routine in routines" 
          :key="routine.id" 
          @click="$router.push(`/routines/${routine.id}`)"
          class="card-container !p-3 flex flex-col gap-2 active:scale-95 transition-transform cursor-pointer"
        >
          <div class="w-8 h-8 bg-gym-primary text-white rounded-lg flex items-center justify-center font-bold p-1">
            <MuscleIcon :muscle="routine.muscle_focus?.[0]" />
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

const auth = useAuthStore()
const loading = ref(true)

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
      .select(`id, started_at, workout_sets ( exercises ( muscle_group ) )`)
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
        return { id: w.id, muscle: mode || 'General' }
      }) || []

    // 3. Fetch Récords (Cálculo 1RM Estimado: Peso * (1 + 0.0333 * reps))
    const { data: sets } = await supabase
      .from('workout_sets')
      .select('weight, reps, exercises(name)')
      .eq('weight_unit', 'kg')

    const best1RM = {}
    sets?.forEach(s => {
      if (!s.exercises) return
      const est1RM = Math.round(s.weight * (1 + 0.0333 * s.reps))
      if (!best1RM[s.exercises.name] || est1RM > best1RM[s.exercises.name]) {
        best1RM[s.exercises.name] = est1RM
      }
    })
    
    records.value = Object.entries(best1RM)
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight)
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

const monthLabels = computed(() => {
  const labels = []
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  heatmapData.value.forEach((week, index) => {
    // Buscamos si el día 1 de algún mes está en esta semana
    for (const day of week) {
      if (day.isValid && day.dateObj.getDate() === 1) {
        labels.push({
          name: monthNames[day.dateObj.getMonth()],
          index: index
        })
        break 
      }
    }
  })
  return labels
})

const getMuscleIcon = (muscle) => {
  if (!muscle) return '💪'
  return muscle[0].toUpperCase()
}
</script>
