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
        <label class="text-label block mb-1">Nombre de la Rutina</label>
        <input v-model="routine.name" type="text" class="input-field font-bold text-lg" placeholder="Ej: Pecho Destructor">
      </div>
      
      <div>
        <label class="text-label block mb-1">Enfoque Muscular</label>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="muscle in muscleGroups" 
            :key="muscle"
            @click="toggleMuscle(muscle)"
            class="px-3 py-1 rounded-full text-xs font-bold border transition-colors"
            :class="routine.muscle_focus.includes(muscle) ? 'bg-gym-primary text-white border-gym-primary' : 'bg-white text-gym-muted border-gray-200'"
          >
            {{ muscle }}
          </button>
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
              <input v-model="exercise.target_sets" type="number" class="input-field py-1 text-center font-semibold">
            </div>
            <div class="col-span-2">
              <label class="text-[10px] text-gym-muted uppercase font-bold">Reps Objetivo</label>
              <input v-model="exercise.target_reps" type="text" class="input-field py-1 text-center font-semibold" placeholder="Ej: 8-12">
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
    <div class="fixed bottom-4 left-4 right-4 z-40 flex flex-col gap-2">
      <button v-if="!isNew" @click="router.push(`/workout/${route.params.id}`)" class="btn-primary w-full py-4 shadow-xl text-lg bg-gym-secondary border-none">
        ▶ Iniciar Entrenamiento
      </button>
      <button @click="saveRoutine" class="btn-primary w-full py-4 shadow-xl text-lg">
        {{ isNew ? 'Crear Rutina' : 'Guardar Cambios' }}
      </button>
    </div>

    <!-- Modal Simplificado de Selección de Ejercicios -->
    <div v-if="showExerciseSelector" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div class="bg-white w-full max-w-md h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-bold text-lg">Seleccionar Ejercicio</h3>
          <button @click="showExerciseSelector = false" class="text-gray-500">Cerrar</button>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <input type="text" placeholder="Buscar..." class="input-field mb-4">
          <div class="space-y-2">
            <div 
              v-for="ex in availableExercises" 
              :key="ex.id"
              @click="addExercise(ex)"
              class="p-3 border rounded-lg active:bg-gray-50 flex justify-between items-center"
            >
              <span>{{ ex.name }}</span>
              <span class="text-xs text-gym-muted">{{ ex.muscle_group }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isNew = computed(() => route.params.id === 'new')
const showExerciseSelector = ref(false)
const loading = ref(false)

const muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abs', 'Full Body']

// Estado de la Rutina
const routine = ref({
  name: '',
  muscle_focus: [],
  exercises: []
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
    target_reps: '10'
  })
  showExerciseSelector.value = false
}

const removeExercise = (index) => {
  routine.value.exercises.splice(index, 1)
}

const saveRoutine = async () => {
  if (!routine.value.name) return alert('Ponle nombre a la rutina')
  loading.value = true

  try {
    let routineId = route.params.id

    // 1. Upsert Rutina
    const routinePayload = {
      user_id: auth.user.id,
      name: routine.value.name,
      muscle_focus: routine.value.muscle_focus
    }

    if (isNew.value) {
      const { data, error } = await supabase.from('routines').insert(routinePayload).select().single()
      if (error) throw error
      routineId = data.id
    } else {
      const { error } = await supabase.from('routines').update(routinePayload).eq('id', routineId)
      if (error) throw error
    }

    // 2. Manejar Ejercicios (Borrar todos los anteriores y recrear para simplificar orden)
    if (!isNew.value) {
      await supabase.from('routine_exercises').delete().eq('routine_id', routineId)
    }

    if (routine.value.exercises.length > 0) {
      const exercisesPayload = routine.value.exercises.map((ex, idx) => ({
        routine_id: routineId,
        exercise_id: ex.id,
        order: idx,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps
      }))
      
      const { error: exError } = await supabase.from('routine_exercises').insert(exercisesPayload)
      if (exError) throw exError
    }

    router.back()
  } catch (e) {
    alert('Error al guardar: ' + e.message)
  } finally {
    loading.value = false
  }
}
</script>
