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
          <div class="w-8 h-8 bg-gym-primary text-white rounded-lg flex items-center justify-center font-bold">
            {{ routine.name[0] }}
          </div>
          
          <div class="flex items-start justify-between gap-1">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gym-dark leading-tight truncate">{{ routine.name }}</h3>
              <p class="text-xs text-gym-muted mt-1 truncate">{{ routine.muscle_focus?.join(', ') }}</p>
            </div>

            <!-- Botón de Opciones (3 puntitos) -->
            <button 
              @click.stop="openOptions(routine)"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gym-dark transition-colors -mr-2 flex-shrink-0"
            >
              ⋮
            </button>
          </div>
        </div>
          
                  <!-- Botón Crear Nueva Rutina -->
                  <button 
                    @click="createNewRoutine"
                    class="card-container !p-4 flex flex-col gap-3 items-center justify-center bg-gray-50 border-dashed border-2 border-gray-300 active:bg-gray-100 min-h-[100px]"
                  >
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      <span class="text-2xl font-bold">+</span>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Nueva Rutina</span>
                  </button>
                </div>
              </section>
          
              <!-- Action Sheet (Menú de Opciones) -->
              <div v-if="showActionSheet" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" @click="closeOptions">
                <div class="bg-white w-full max-w-md rounded-t-2xl p-4 animate-slide-up flex flex-col gap-2" @click.stop>
                  <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <h3 class="text-center font-bold text-gray-900 mb-2">Opciones: {{ selectedRoutine?.name }}</h3>
                  
                  <button @click="startRename" class="w-full py-3 bg-gray-50 rounded-xl font-semibold text-gym-dark active:bg-gray-200">
                    ✏️ Renombrar
                  </button>
                  
                  <button @click="deleteRoutine" class="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold active:bg-red-100">
                    🗑️ Eliminar Rutina
                  </button>
                  
                  <button @click="closeOptions" class="w-full py-3 mt-2 text-gray-500 font-bold">
                    Cancelar
                  </button>
                </div>
              </div>
          
              <!-- Modal Renombrar -->
              <div v-if="showRenameModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" @click="showRenameModal = false">
                <div class="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl" @click.stop>
                  <h3 class="font-bold text-lg mb-4">Renombrar Rutina</h3>
                  <input 
                    v-model="newName" 
                    type="text" 
                    class="input-field mb-4 font-bold" 
                    placeholder="Nuevo nombre..."
                    @keyup.enter="confirmRename"
                  >
                  <div class="flex gap-2">
                    <button @click="showRenameModal = false" class="flex-1 py-2 text-gray-500 font-bold">Cancelar</button>
                    <button @click="confirmRename" class="flex-1 btn-primary py-2 justify-center">Guardar</button>
                  </div>
                </div>
              </div>
          
            </div>
          </template>
          
          <style scoped>
          .animate-slide-up {
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          </style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const routines = ref([])
const loading = ref(true)

// Action Sheet State
const showActionSheet = ref(false)
const showRenameModal = ref(false)
const selectedRoutine = ref(null)
const newName = ref('')

const openOptions = (routine) => {
  selectedRoutine.value = routine
  showActionSheet.value = true
}

const closeOptions = () => {
  showActionSheet.value = false
  // No limpiar selectedRoutine aquí todavía para animaciones si las hubiera, pero ok
}

const startRename = () => {
  newName.value = selectedRoutine.value.name
  showActionSheet.value = false
  showRenameModal.value = true
}

const confirmRename = async () => {
  if (!newName.value.trim()) return
  
  try {
    const { error } = await supabase
      .from('routines')
      .update({ name: newName.value })
      .eq('id', selectedRoutine.value.id)
      
    if (error) throw error
    
    // Actualizar localmente
    const index = routines.value.findIndex(r => r.id === selectedRoutine.value.id)
    if (index !== -1) routines.value[index].name = newName.value
    
    showRenameModal.value = false
  } catch (e) {
    alert('Error al renombrar: ' + e.message)
  }
}

const deleteRoutine = async () => {
  if (!confirm(`¿Seguro que quieres borrar "${selectedRoutine.value.name}"? Esta acción no se puede deshacer.`)) return

  try {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', selectedRoutine.value.id)

    if (error) throw error

    // Eliminar localmente
    routines.value = routines.value.filter(r => r.id !== selectedRoutine.value.id)
    showActionSheet.value = false
  } catch (e) {
    alert('Error al eliminar: ' + e.message)
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
