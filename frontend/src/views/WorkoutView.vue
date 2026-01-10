<template>
  <div class="pb-32">
    <!-- Header Fijo: Botón Regresar, Cronómetro y Finalizar -->
    <header class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-40 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-4">
        <!-- Botón Regresar -->
        <button @click="goBack" class="text-gym-primary hover:text-gym-secondary transition-colors active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <!-- Cronómetro -->
        <div class="flex flex-col">
          <span class="text-xs text-gym-muted font-bold uppercase">Tiempo</span>
          <span class="font-mono text-xl font-bold text-gym-dark">{{ formattedTime }}</span>
        </div>
      </div>
      <button @click="finishWorkout" class="btn-success bg-gym-secondary text-white px-6 py-2 rounded-lg font-bold shadow-md active:scale-95">
        Finalizar
      </button>
    </header>

    <!-- Espaciador para el header fijo -->
    <div class="h-20"></div>

    <div class="px-4">
      <h1 class="heading-1 mt-4">{{ workoutTitle }}</h1>

      <!-- Lista de Ejercicios Activos -->
      <div class="space-y-6">
        <div v-for="(exercise, exIndex) in activeExercises" :key="exercise.id" class="card-container !p-0 overflow-hidden">
          
          <!-- Encabezado del Ejercicio -->
          <div class="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-gym-dark">{{ exercise.name }}</h3>
            <button class="text-gym-primary text-sm font-bold">Opciones</button>
          </div>

          <!-- Tabla de Sets -->
          <div class="p-3">
            <div class="grid grid-cols-10 gap-2 mb-2 text-[10px] text-gym-muted font-bold text-center uppercase tracking-wider">
              <div class="col-span-1">Set</div>
              <div class="col-span-3">Previo</div>
              <div class="col-span-2">Kg</div>
              <div class="col-span-2">Reps</div>
              <div class="col-span-2">Listo</div>
            </div>

            <div v-for="(set, setIndex) in exercise.sets" :key="setIndex" 
                 class="grid grid-cols-10 gap-2 items-center mb-3"
                 :class="{ 'opacity-50': set.completed }">
              
              <!-- Número de Set -->
              <div class="col-span-1 flex justify-center">
                <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {{ setIndex + 1 }}
                </div>
              </div>

              <!-- Historial (Read Only) -->
              <div class="col-span-3 text-center flex flex-col justify-center bg-gray-50 rounded py-1 border border-gray-100">
                <span v-if="set.prevWeight" class="text-xs font-semibold text-gym-muted">
                  {{ set.prevWeight }} <span class="text-[9px]">kg</span>
                </span>
                <span v-if="set.prevReps" class="text-[10px] text-gray-400">
                  x {{ set.prevReps }}
                </span>
                <span v-else class="text-[10px] text-gray-300">-</span>
              </div>

              <!-- Input Peso -->
              <div class="col-span-2">
                <input 
                  type="number" 
                  v-model="set.weight" 
                  @input="validateInput($event, 3)"
                  class="input-field text-center py-1 px-0 font-bold text-gym-dark" 
                  placeholder="-"
                >
              </div>

              <!-- Input Reps -->
              <div class="col-span-2">
                <input 
                  type="number" 
                  v-model="set.reps" 
                  @input="validateInput($event, 2)"
                  class="input-field text-center py-1 px-0 font-bold text-gym-dark" 
                  placeholder="-"
                >
              </div>

              <!-- Checkbox Completado -->
              <div class="col-span-2 flex justify-center">
                <button 
                  @click="toggleSet(exercise.id, setIndex)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center transition-all border-2"
                  :class="set.completed ? 'bg-gym-secondary border-gym-secondary text-white' : 'bg-white border-gray-200 text-transparent'"
                >
                  ✓
                </button>
              </div>
            </div>

            <!-- Botón Agregar Set -->
            <button @click="addSet(exIndex)" class="w-full py-2 bg-gray-50 text-gym-muted text-xs font-bold uppercase rounded hover:bg-gray-100 mt-2">
              + Agregar Serie
            </button>
          </div>
        </div>
      </div>

      <!-- Botón Agregar Ejercicio -->
      <button @click="showExerciseSelector = true" class="btn-secondary w-full py-3 mt-4 border-dashed">
        + Agregar Ejercicio
      </button>

      <!-- Modal Selector Reutilizable -->
      <ExerciseSelector 
        :is-open="showExerciseSelector"
        :exercises="availableExercises"
        @close="showExerciseSelector = false"
        @select="addExerciseToWorkout"
      />

      <!-- Modal de Confirmación para Salir -->
      <ConfirmDialog
        :is-open="showExitConfirm"
        title="¿Salir del entrenamiento?"
        message="Los cambios no guardados se perderán."
        icon="🚪"
        confirm-text="Salir"
        cancel-text="Quedarme"
        :danger="true"
        @confirm="confirmExit"
        @cancel="showExitConfirm = false"
        @close="showExitConfirm = false"
      />

      <!-- Modal de Confirmación para Finalizar -->
      <ConfirmDialog
        :is-open="showFinishConfirm"
        title="¿Terminar entrenamiento?"
        message="Se guardará tu progreso y finalizará el entrenamiento."
        icon="✅"
        confirm-text="Finalizar"
        cancel-text="Cancelar"
        @confirm="confirmFinish"
        @cancel="showFinishConfirm = false"
        @close="showFinishConfirm = false"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../stores/notifications'
import ExerciseSelector from '../components/ExerciseSelector.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { success, error, warning } = useNotifications()

const workoutTitle = ref('Entrenamiento Libre')
const loading = ref(true)
const activeExercises = ref([])
const showExerciseSelector = ref(false)
const availableExercises = ref([])
const showExitConfirm = ref(false)
const showFinishConfirm = ref(false)

// Timer Logic
const seconds = ref(0)
let timerInterval = null

const formattedTime = computed(() => {
  const h = Math.floor(seconds.value / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds.value % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds.value % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const validateInput = (e, maxDigits) => {
  let val = e.target.value.toString()
  val = val.replace(/[^0-9]/g, '').replace(/^0+/, '')
  if (val.length > maxDigits) val = val.slice(0, maxDigits)
  e.target.value = val
  // Actualizar el modelo reactivo manualmente si es necesario, 
  // aunque v-model suele captarlo, al manipular e.target.value a veces vue necesita ayuda
  // En este caso, al ser v-model dentro de un v-for, Vue actualizará el objeto set.weight correctamente al siguiente ciclo
}

onMounted(async () => {
  timerInterval = setInterval(() => { seconds.value++ }, 1000)
  
  // Cargar ejercicios disponibles para el selector
  const { data: exercises } = await supabase.from('exercises').select('*').order('name')
  availableExercises.value = exercises || []

  if (route.params.id !== 'free') {
    await loadRoutineWorkout(route.params.id)
  } else {
    loading.value = false
  }
})

onUnmounted(() => clearInterval(timerInterval))

const loadRoutineWorkout = async (routineId) => {
  try {
    // 1. Cargar info de la rutina
    const { data: routine } = await supabase.from('routines').select('*').eq('id', routineId).single()
    if (routine) workoutTitle.value = routine.name

    // 2. Cargar ejercicios de la rutina
    const { data: routineExercises } = await supabase
      .from('routine_exercises')
      .select('*, exercises(*)')
      .eq('routine_id', routineId)
      .order('order')

    if (routineExercises) {
      // Mapear a estructura de UI y buscar historial para CADA ejercicio
      const exercisesWithHistory = await Promise.all(routineExercises.map(async (re) => {
        const history = await fetchLastHistory(re.exercise_id)
        
        // Crear sets iniciales basados en la meta
        const sets = []
        for (let i = 0; i < (re.target_sets || 3); i++) {
          sets.push({
            weight: '', // Empezar vacío para obligar input
            reps: '',
            completed: false,
            prevWeight: history?.weight || null,
            prevReps: history?.reps || null
          })
        }

        return {
          id: re.exercise_id,
          name: re.exercises.name,
          sets
        }
      }))
      
      activeExercises.value = exercisesWithHistory
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchLastHistory = async (exerciseId) => {
  // Buscar el último set completado de este ejercicio por el usuario
  const { data } = await supabase
    .from('workout_sets')
    .select('weight, reps, created_at')
    .eq('exercise_id', exerciseId)
    // .eq('user_id', auth.user.id) // RLS ya filtra, pero bueno
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  return data
}

const addExerciseToWorkout = async (exercise) => {
  const history = await fetchLastHistory(exercise.id)
  activeExercises.value.push({
    id: exercise.id,
    name: exercise.name,
    sets: [
      { weight: '', reps: '', completed: false, prevWeight: history?.weight, prevReps: history?.reps }
    ]
  })
  showExerciseSelector.value = false
}

const toggleSet = (exId, setIndex) => {
  const exercise = activeExercises.value.find(e => e.id === exId)
  if (exercise) {
    const set = exercise.sets[setIndex]
    
    // Si vamos a marcar como completado (true), validar primero
    if (!set.completed) {
      if (!set.weight || parseFloat(set.weight) <= 0) {
        warning('El peso debe ser mayor a 0 kg', 'Validación')
        return
      }
      if (!set.reps || parseInt(set.reps) <= 0) {
        warning('Las repeticiones deben ser mayor a 0', 'Validación')
        return
      }
    }
    
    set.completed = !set.completed
  }
}

const addSet = (exIndex) => {
  const previousSet = activeExercises.value[exIndex].sets[activeExercises.value[exIndex].sets.length - 1]
  activeExercises.value[exIndex].sets.push({
    weight: previousSet ? previousSet.weight : '',
    reps: previousSet ? previousSet.reps : '',
    completed: false,
    prevWeight: null,
    prevReps: null
  })
}

const goBack = () => {
  // Si no hay ejercicios agregados, salir directamente sin confirmación
  if (activeExercises.value.length === 0) {
    router.push('/')
    return
  }
  
  // Si hay ejercicios, mostrar confirmación
  showExitConfirm.value = true
}

const confirmExit = () => {
  router.push('/')
}

const finishWorkout = () => {
  showFinishConfirm.value = true
}

const confirmFinish = async () => {
  try {
    // 1. Preparar Sets (Validación primero)
    const setsToInsert = []
    activeExercises.value.forEach(ex => {
      ex.sets.forEach((set, idx) => {
        if (set.completed && set.weight && set.reps) {
          setsToInsert.push({
            // workout_id se asignará después
            exercise_id: ex.id,
            set_number: idx + 1,
            weight: set.weight,
            reps: set.reps,
            weight_unit: 'kg'
          })
        }
      })
    })

    if (setsToInsert.length === 0) {
      warning('No has registrado ninguna serie completa. El entrenamiento no se guardará.', 'Sin series completadas')
      router.push('/')
      return
    }

    // 2. Crear Workout (Solo si hay sets validos)
    const { data: workout, error: wError } = await supabase.from('workouts').insert({
      user_id: auth.user.id,
      routine_id: route.params.id !== 'free' ? route.params.id : null,
      started_at: new Date(Date.now() - seconds.value * 1000).toISOString(),
      ended_at: new Date().toISOString()
    }).select().single()

    if (wError) throw wError

    // 3. Insertar Sets con el ID del workout creado
    const setsWithId = setsToInsert.map(s => ({ ...s, workout_id: workout.id }))
    
    const { error: sError } = await supabase.from('workout_sets').insert(setsWithId)
    if (sError) throw sError

    success('¡Entrenamiento guardado correctamente!', 'Completado')
    router.push('/')
  } catch (e) {
    error('No se pudo guardar el entrenamiento: ' + e.message, 'Error')
  }
}
</script>
