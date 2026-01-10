<template>
  <div class="pb-32"> <!-- Padding extra para el botón flotante inferior -->
    <!-- Header Navegación -->
    <div class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="p-2 -ml-2 text-gym-muted hover:text-gym-dark">
        ← Volver
      </button>
      <h1 class="text-xl font-bold">{{ isNew ? 'Nueva Rutina' : 'Editar Rutina' }}</h1>
    </div>

    <!-- Formulario Principal -->
    <section class="mb-6 space-y-4">
      <div>
        <label class="text-label block mb-1">Nombre e Icono</label>
        <div class="flex gap-3 items-center">
          <!-- Icon Trigger -->
          <button 
            @click="showEmojiPicker = true"
            class="w-14 h-14 flex-shrink-0 bg-gym-primary text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm active:scale-95 transition-transform"
          >
             <!-- Si hay custom_icon lo mostramos, si no, mostramos la inicial o el icono smart (aquí usaremos inicial como placeholder hasta guardar) -->
             <span v-if="routine.custom_icon">{{ routine.custom_icon }}</span>
             <span v-else>{{ routine.name ? routine.name[0] : '?' }}</span>
          </button>
          
          <div class="flex-1">
            <input v-model="routine.name" type="text" class="input-field font-bold text-lg" placeholder="Ej: Pecho Destructor">
          </div>
        </div>
      </div>
    </section>

    <!-- Lista de Ejercicios -->
    <section>
      <div class="flex justify-between items-end mb-3">
        <h2 class="heading-2 !mb-0">Ejercicios</h2>
        <button @click="showExerciseSelector = true" class="text-sm font-bold text-gym-primary flex items-center gap-1">
          + Agregar
        </button>
      </div>

      <div class="space-y-3">
        <div v-for="(exercise, index) in routine.exercises" :key="index" class="card-container relative group">
          <!-- Botón Eliminar (Visible o slide) -->
          <button @click="removeExercise(index)" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1">
            ×
          </button>

          <h3 class="font-bold text-gym-dark mb-2">{{ exercise.name }}</h3>
          
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-[10px] text-gym-muted uppercase font-bold">Series</label>
              <input 
                v-model="exercise.target_sets" 
                @input="validateInput($event, 2)"
                type="number" 
                class="input-field py-1 text-center font-semibold"
              >
            </div>
            <div>
              <label class="text-[10px] text-gym-muted uppercase font-bold">Reps Obj.</label>
              <input 
                v-model="exercise.target_reps" 
                @input="validateRepsStr($event)"
                type="text" 
                class="input-field py-1 text-center font-semibold" 
                placeholder="8-12"
              >
            </div>
            <div>
              <label class="text-[10px] text-gym-muted uppercase font-bold">Peso (kg)</label>
              <input 
                v-model="exercise.target_weight" 
                @input="validateInput($event, 3)"
                type="number" 
                class="input-field py-1 text-center font-semibold" 
                placeholder="0"
              >
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="routine.exercises.length === 0" class="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <p class="text-gym-muted text-sm">Añade ejercicios a esta rutina</p>
      </div>
    </section>

    <!-- Floating Save/Start Buttons -->
    <div class="fixed bottom-24 left-4 right-4 z-40 flex flex-col gap-2">
      <button v-if="!isNew" @click="router.push(`/workout/${route.params.id}`)" class="btn-primary w-full py-4 shadow-xl text-lg bg-gym-secondary border-none">
        ▶ Iniciar Entrenamiento
      </button>
      <button @click="saveRoutine" class="btn-primary w-full py-4 shadow-xl text-lg">
        {{ isNew ? 'Crear Rutina' : 'Guardar Cambios' }}
      </button>
    </div>

    <!-- Modal Selector Reutilizable -->
    <ExerciseSelector 
      :is-open="showExerciseSelector"
      :exercises="availableExercises"
      @close="showExerciseSelector = false"
      @select="addExercise"
    />

    <EmojiPicker 
      :is-open="showEmojiPicker"
      @close="showEmojiPicker = false"
      @select="selectEmoji"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../stores/notifications'
import ExerciseSelector from '../components/ExerciseSelector.vue'
import EmojiPicker from '../components/EmojiPicker.vue'
import MuscleIcon from '../components/MuscleIcon.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { success, error, warning } = useNotifications()

const isNew = computed(() => route.params.id === 'new')
const showExerciseSelector = ref(false)
const loading = ref(false)

const muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abs', 'Full Body']

// Estado de la Rutina
const routine = ref({
  name: '',
  muscle_focus: [],
  exercises: [],
  custom_icon: null
})

const availableExercises = ref([])

onMounted(async () => {
  await fetchAvailableExercises()
  
  if (!isNew.value) {
    await fetchRoutineDetails()
  }
})

const fetchAvailableExercises = async () => {
  // Traer ejercicios públicos O del usuario
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')
  
  if (!error) availableExercises.value = data
}

const fetchRoutineDetails = async () => {
  loading.value = true
  // 1. Datos de la rutina
  const { data: routineData, error: routineError } = await supabase
    .from('routines')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (routineError) {
    console.error(routineError)
    return
  }

  // 2. Ejercicios de la rutina
  const { data: exercisesData, error: exError } = await supabase
    .from('routine_exercises')
    .select('*, exercises(name, muscle_group)') // Join con exercises
    .eq('routine_id', route.params.id)
    .order('order')

  if (!exError) {
    routine.value = {
      ...routineData,
      exercises: exercisesData.map(e => ({
        id: e.exercise_id, // ID del ejercicio base
        routine_exercise_id: e.id, // ID en la tabla de unión
        name: e.exercises.name,
        muscle_group: e.exercises.muscle_group,
        target_sets: e.target_sets,
        target_reps: e.target_reps
      }))
    }
  }
  loading.value = false
}

const toggleMuscle = (muscle) => {
  const index = routine.value.muscle_focus.indexOf(muscle)
  if (index >= 0) {
    routine.value.muscle_focus.splice(index, 1)
  } else {
    routine.value.muscle_focus.push(muscle)
  }
}

const addExercise = (exercise) => {
  routine.value.exercises.push({
    id: exercise.id,
    name: exercise.name,
    muscle_group: exercise.muscle_group,
    target_sets: 4,
    target_reps: '10',
    target_weight: 0
  })
  showExerciseSelector.value = false
}

const removeExercise = (index) => {
  routine.value.exercises.splice(index, 1)
}

const validateInput = (e, maxDigits) => {
  let val = e.target.value.toString()
  // 1. Eliminar caracteres no numéricos
  val = val.replace(/[^0-9]/g, '')
  // 2. Eliminar ceros a la izquierda (evita "0", "05")
  val = val.replace(/^0+/, '')
  // 3. Limitar longitud
  if (val.length > maxDigits) val = val.slice(0, maxDigits)
  
  // Actualizar valor (Vue v-model needs manual trigger sometimes on input manipulation)
  e.target.value = val
  // Nota: Para v-model number, si el string es vacío, Vue puede ponerlo null o dejarlo.
}

const validateRepsStr = (e) => {
  let val = e.target.value
  // Permitir números y guión, max 5 chars (99-99)
  val = val.replace(/[^0-9-]/g, '')
  if (val.length > 5) val = val.slice(0, 5)
  e.target.value = val
}

const normalizeReps = (reps) => {
  if (!reps) return '10'
  // Reemplazar / por -, eliminar espacios y todo lo que no sea numero o -
  return String(reps)
    .replace(/\//g, '-')
    .replace(/\s+/g, '')
    .replace(/[^0-9-]/g, '')
}

const saveRoutine = async () => {
  if (!routine.value.name) {
    warning('Ponle un nombre a la rutina', 'Falta el nombre')
    return
  }
  loading.value = true

  try {
    let routineId = route.params.id

    // Calcular Enfoque Muscular automáticamente
    const allMuscles = routine.value.exercises.map(ex => ex.muscle_group).filter(Boolean)
    
    // Contadores
    let upperCount = 0
    let lowerCount = 0
    const counts = {}

    const upperMuscles = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Bíceps', 'Tríceps', 'Abs']
    const lowerMuscles = ['Piernas', 'Cuádriceps', 'Isquios', 'Glúteos', 'Pantorrilla']

    allMuscles.forEach(m => {
      counts[m] = (counts[m] || 0) + 1
      if (upperMuscles.some(u => m.includes(u))) upperCount++
      if (lowerMuscles.some(l => m.includes(l))) lowerCount++
    })

    let dominantFocus = []
    
    // Lógica de decisión
    if (upperCount > 0 && lowerCount > 0) {
      // Si hay mezcla significativa, es Full Body
      if (upperCount >= 2 && lowerCount >= 2) {
        dominantFocus = ['Full Body']
      } else {
        // Si no es tan balanceado, tomamos el mayoritario + el minoritario
        dominantFocus = upperCount > lowerCount ? ['Upper Body'] : ['Lower Body']
      }
    } else if (upperCount > 0) {
       // Solo Upper: Ver si hay un músculo específico dominante (>50%)
       const maxMuscle = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
       if (counts[maxMuscle] / allMuscles.length >= 0.5) {
         dominantFocus = [maxMuscle]
       } else {
         dominantFocus = ['Upper Body']
       }
    } else if (lowerCount > 0) {
       // Solo Lower
       const maxMuscle = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
       if (counts[maxMuscle] / allMuscles.length >= 0.5) {
         dominantFocus = [maxMuscle]
       } else {
         dominantFocus = ['Lower Body']
       }
    }

    // Validaciones de Negocio
    if (isNew.value) {
      // 1. Validar Max 10 Rutinas (Exacto)
      const { count, error: countError } = await supabase
        .from('routines')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth.user.id)
      
      if (countError) throw countError
      if (count >= 10) {
        throw new Error('Límite de 10 rutinas alcanzado. Debes eliminar una rutina existente antes de crear una nueva.')
      }
    }

    // 2. Validar Min 3 Ejercicios
    if (routine.value.exercises.length < 3) {
      throw new Error('La rutina debe tener al menos 3 ejercicios para ser efectiva.')
    }

    // 1. Upsert Rutina
    const routinePayload = {
      user_id: auth.user.id,
      name: routine.value.name,
      muscle_focus: dominantFocus.length > 0 ? dominantFocus : ['General'],
      custom_icon: routine.value.custom_icon
    }

    if (isNew.value) {
      const { data, error: err } = await supabase.from('routines').insert(routinePayload).select().single()
      if (err) throw err
      routineId = data.id
    } else {
      const { error: err } = await supabase.from('routines').update(routinePayload).eq('id', routineId)
      if (err) throw err
    }

    // 2. Manejar Ejercicios
    if (!isNew.value) {
      await supabase.from('routine_exercises').delete().eq('routine_id', routineId)
    }

    if (routine.value.exercises.length > 0) {
      // Validar ejercicios antes de guardar
      for (const ex of routine.value.exercises) {
        if (!ex.target_sets || ex.target_sets < 1) {
          throw new Error(`El ejercicio "${ex.name}" debe tener al menos 1 serie.`)
        }
        if (!ex.target_reps || ex.target_reps === '0' || ex.target_reps === '0-0') {
          throw new Error(`El ejercicio "${ex.name}" debe tener repeticiones válidas.`)
        }
      }

      const exercisesPayload = routine.value.exercises.map((ex, idx) => ({
        routine_id: routineId,
        exercise_id: ex.id,
        order: idx,
        target_sets: ex.target_sets,
        target_reps: normalizeReps(ex.target_reps),
        notes: ex.target_weight ? `${ex.target_weight}kg` : null 
      }))
      
      const { error: exError } = await supabase.from('routine_exercises').insert(exercisesPayload)
      if (exError) throw exError
    }

    success(isNew.value ? 'Rutina creada correctamente' : 'Cambios guardados correctamente')
    router.back()
  } catch (e) {
    error(e.message, 'Error al guardar')
  } finally {
    loading.value = false
  }
}
</script>
