<template>
  <div>
    <h1 class="heading-1">Tus Rutinas</h1>

    <!-- Botón Ejercicio Libre -->
    <section class="mb-6">
      <button 
        @click="router.push('/workout/free')"
        class="w-full btn-secondary flex items-center justify-center gap-2 py-4 border-dashed border-2"
      >
        <span class="text-xl">⚡</span>
        <span class="font-bold">Iniciar Entrenamiento Libre</span>
      </button>
    </section>

    <!-- Lista de Rutinas -->
    <section>
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 gap-3">
        <SkeletonRoutineCard v-for="i in 6" :key="i" />
      </div>
      
      <!-- Empty State -->
      <EmptyState
        v-else-if="routines.length === 0"
        icon="😕"
        title="No tienes rutinas creadas."
        description="¡Crea la primera abajo!"
        container-class="py-8"
      />

      <!-- Data -->
      <div v-else class="grid grid-cols-2 gap-3">
        <!-- Tarjeta de Rutina -->
        <div 
          v-for="routine in routines" 
          :key="routine.id" 
          @click="openRoutine(routine.id)"
          class="card-container !p-4 flex flex-col gap-3 card-hover"
        >
          <!-- Icono basado en el músculo -->
          <div class="w-8 h-8 bg-mulled-wine-500 text-mulled-wine-50 rounded-lg flex items-center justify-center font-bold p-1 text-xl">
            <span v-if="routine.custom_icon">{{ routine.custom_icon }}</span>
            <MuscleIcon v-else :muscle="routine.muscle_focus?.[0]" />
          </div>
          
          <div class="flex items-start justify-between gap-1">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-mulled-wine-50 leading-tight truncate">{{ routine.name }}</h3>
              <p class="text-xs text-mulled-wine-300 mt-1 truncate">{{ routine.muscle_focus?.join(', ') }}</p>
            </div>

            <!-- Botón de Opciones (3 puntitos) -->
            <button 
              @click.stop="openOptions(routine)"
              class="w-8 h-8 flex items-center justify-center rounded-full text-mulled-wine-300 text-hover -mr-2 flex-shrink-0 hover:bg-mulled-wine-700"
            >
              ⋮
            </button>
          </div>
        </div>
          
        <!-- Botón Crear Nueva Rutina -->
        <button 
          @click="routines.length < 10 ? createNewRoutine() : null"
          class="card-container !p-4 flex flex-col gap-3 items-center justify-center bg-mulled-wine-700 border-dashed border-2 border-mulled-wine-500 active:bg-mulled-wine-500 min-h-[100px]"
          :class="{ 'opacity-50 cursor-not-allowed grayscale': routines.length >= 10 }"
        >
          <div class="w-10 h-10 bg-mulled-wine-600 rounded-full flex items-center justify-center text-mulled-wine-300">
            <span class="text-2xl font-bold">{{ routines.length >= 10 ? '🔒' : '+' }}</span>
          </div>
          <span class="text-sm font-bold text-mulled-wine-400">
            {{ routines.length >= 10 ? 'Límite (10) alcanzado' : 'Nueva Rutina' }}
          </span>
        </button>
      </div>
    </section>

    <!-- Action Sheet (Menú de Opciones) -->
    <div v-if="showActionSheet" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" @click="closeOptions">
      <div class="bg-mulled-wine-600 w-full max-w-md rounded-t-2xl p-4 animate-slide-up flex flex-col gap-2" @click.stop>
        <div class="w-12 h-1 bg-mulled-wine-500 rounded-full mx-auto mb-4"></div>
        <h3 class="text-center font-bold text-mulled-wine-50 mb-2">Opciones: {{ selectedRoutine?.name }}</h3>
        
        <button @click="startChangeIcon" class="w-full py-3 bg-mulled-wine-700 rounded-xl font-semibold text-mulled-wine-50 hover:bg-mulled-wine-500 active:bg-mulled-wine-400 transition-colors">
          🎨 Cambiar Icono
        </button>

        <button @click="startRename" class="w-full py-3 bg-mulled-wine-700 rounded-xl font-semibold text-mulled-wine-50 hover:bg-mulled-wine-500 active:bg-mulled-wine-400 transition-colors">
          ✏️ Renombrar
        </button>
        
        <button @click="deleteRoutine" class="w-full btn-danger rounded-xl">
          🗑️ Eliminar Rutina
        </button>
        
        <button @click="closeOptions" class="w-full btn-cancel mt-2">
          Cancelar
        </button>
      </div>
    </div>

    <!-- Modal Renombrar -->
    <div v-if="showRenameModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" @click="showRenameModal = false">
      <div class="bg-mulled-wine-600 w-full max-w-sm rounded-2xl p-6 shadow-2xl" @click.stop>
        <h3 class="font-bold text-lg text-mulled-wine-50 mb-4">Renombrar Rutina</h3>
        <input 
          v-model="newName" 
          type="text" 
          class="input-field mb-4 font-bold" 
          placeholder="Nuevo nombre..."
          @keyup.enter="confirmRename"
        >
        <div class="flex gap-2">
          <button @click="showRenameModal = false" class="flex-1 btn-cancel text-center">Cancelar</button>
          <button @click="confirmRename" class="flex-1 btn-primary py-2 justify-center">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Emoji Picker (Global para esta vista) -->
    <EmojiPicker 
      :is-open="showEmojiPicker"
      @close="showEmojiPicker = false"
      @select="saveNewIcon"
    />

    <!-- Dialog de Confirmación para Eliminar -->
    <ConfirmDialog
      :is-open="showDeleteConfirm"
      title="¿Eliminar rutina?"
      :message="`¿Seguro que quieres borrar &quot;${selectedRoutine?.name}&quot;? Esta acción no se puede deshacer.`"
      icon="🗑️"
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
      @close="showDeleteConfirm = false"
    />

  </div>
</template>          

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../stores/notifications'
import MuscleIcon from '../components/MuscleIcon.vue'
import EmojiPicker from '../components/EmojiPicker.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'
import SkeletonRoutineCard from '../components/SkeletonRoutineCard.vue'

const router = useRouter()
const auth = useAuthStore()
const { success, error } = useNotifications()
const routines = ref([])
const loading = ref(true)

// Action Sheet State
const showActionSheet = ref(false)
const showRenameModal = ref(false)
const showEmojiPicker = ref(false)
const showDeleteConfirm = ref(false)
const selectedRoutine = ref(null)
const newName = ref('')

const openOptions = (routine) => {
  selectedRoutine.value = routine
  showActionSheet.value = true
}

const startChangeIcon = () => {
  showActionSheet.value = false
  showEmojiPicker.value = true
}

const saveNewIcon = async (emoji) => {
  try {
    const { error: err } = await supabase
      .from('routines')
      .update({ custom_icon: emoji })
      .eq('id', selectedRoutine.value.id)

    if (err) throw err

    // Update local state
    const index = routines.value.findIndex(r => r.id === selectedRoutine.value.id)
    if (index !== -1) routines.value[index].custom_icon = emoji
    
    success('Icono actualizado correctamente')
    showEmojiPicker.value = false
  } catch (e) {
    error('No se pudo guardar el icono: ' + e.message)
  }
}

const closeOptions = () => {
  showActionSheet.value = false
}

const startRename = () => {
  newName.value = selectedRoutine.value.name
  showActionSheet.value = false
  showRenameModal.value = true
}

const confirmRename = async () => {
  if (!newName.value.trim()) return
  
  try {
    const { error: err } = await supabase
      .from('routines')
      .update({ name: newName.value })
      .eq('id', selectedRoutine.value.id)
      
    if (err) throw err
    
    // Actualizar localmente
    const index = routines.value.findIndex(r => r.id === selectedRoutine.value.id)
    if (index !== -1) routines.value[index].name = newName.value
    
    success('Rutina renombrada correctamente')
    showRenameModal.value = false
  } catch (e) {
    error('No se pudo renombrar: ' + e.message)
  }
}

const deleteRoutine = () => {
  showActionSheet.value = false
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    const { error: err } = await supabase
      .from('routines')
      .delete()
      .eq('id', selectedRoutine.value.id)

    if (err) throw err

    // Eliminar localmente
    routines.value = routines.value.filter(r => r.id !== selectedRoutine.value.id)
    success('Rutina eliminada correctamente')
    showDeleteConfirm.value = false
  } catch (e) {
    error('No se pudo eliminar: ' + e.message)
  }
}

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
  const map = {
    'Pecho': 'P', 'Espalda': 'E', 'Piernas': 'L', 'Brazos': 'B', 'Hombros': 'H'
  }
  return map[muscle] || 'G'
}

const getMuscleColor = (muscle) => {
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
  router.push('/routines/new')
}
</script>
