<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm transition-all">
    <div class="bg-app-surface border border-app-border w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up">
      
      <!-- Header -->
      <div class="p-4 border-b border-app-border flex justify-between items-center bg-app-surface rounded-t-2xl z-10">
        <h3 class="font-bold text-lg text-platinum">Seleccionar Ejercicio</h3>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-gunmetal text-silver hover:bg-slate transition-colors">
          ×
        </button>
      </div>

      <!-- Controls (Search + Filter) -->
      <div class="p-4 space-y-3 bg-gunmetal/50 border-b border-app-border">
        <!-- Buscador -->
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar ejercicio..." 
            class="input-field pl-9"
            autofocus
          >
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-silver">🔍</span>
        </div>

        <!-- Filtros de Músculo (Scroll Horizontal) -->
        <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            @click="activeFilter = ''"
            class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border"
            :class="activeFilter === '' ? 'bg-steel text-platinum border-steel' : 'bg-gunmetal text-silver border-app-border'"
          >
            Todos
          </button>
          <button 
            v-for="muscle in uniqueMuscles" 
            :key="muscle"
            @click="activeFilter = activeFilter === muscle ? '' : muscle"
            class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors border"
            :class="activeFilter === muscle ? 'bg-steel text-platinum border-steel' : 'bg-gunmetal text-silver border-app-border'"
          >
            {{ muscle }}
          </button>
        </div>
      </div>

      <!-- Lista de Resultados -->
      <div class="flex-1 overflow-y-auto p-2">
        <div v-if="filteredExercises.length === 0" class="flex flex-col items-center justify-center h-40 text-app-text-muted">
          <span class="text-2xl mb-2">😕</span>
          <p class="text-sm">No se encontraron ejercicios.</p>
        </div>

        <div class="space-y-1">
          <div 
            v-for="ex in filteredExercises" 
            :key="ex.id"
            @click="$emit('select', ex)"
            class="p-3 rounded-lg hover:bg-slate active:bg-steel cursor-pointer flex justify-between items-center group transition-colors border border-transparent hover:border-app-border"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gunmetal flex items-center justify-center text-lg font-bold text-silver group-hover:bg-app-surface group-hover:shadow-sm group-hover:text-platinum transition-all">
                {{ ex.name[0] }}
              </div>
              <div>
                <p class="font-bold text-platinum text-sm">{{ ex.name }}</p>
                <p class="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">{{ ex.muscle_group }}</p>
              </div>
            </div>
            
            <button class="text-steel opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">
              + Agregar
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  exercises: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const activeFilter = ref('')

// Obtener lista única de músculos basada en los ejercicios disponibles
const uniqueMuscles = computed(() => {
  const muscles = props.exercises.map(e => e.muscle_group).filter(Boolean)
  return [...new Set(muscles)].sort()
})

const filteredExercises = computed(() => {
  let result = props.exercises

  // 1. Filtro por Buscador (Insensible a mayúsculas/acentos simple)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(e => e.name.toLowerCase().includes(query))
  }

  // 2. Filtro por Músculo
  if (activeFilter.value) {
    result = result.filter(e => e.muscle_group === activeFilter.value)
  }

  return result
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
