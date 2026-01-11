<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm transition-all" @click="$emit('close')">
    <div class="bg-mulled-wine-600 border border-mulled-wine-500 w-full max-w-sm h-[60vh] sm:h-auto rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up" @click.stop>
      
      <div class="p-4 border-b border-mulled-wine-500 flex justify-between items-center">
        <h3 class="font-bold text-lg text-mulled-wine-50">Elige un Icono</h3>
        <button @click="$emit('close')" class="text-mulled-wine-300 hover:text-mulled-wine-50 text-2xl transition-colors">×</button>
      </div>

      <div class="p-4 overflow-y-auto grid grid-cols-5 gap-4 text-2xl">
        <!-- Opción para quitar icono (volver al default) -->
        <button @click="$emit('select', null)" class="flex items-center justify-center w-10 h-10 rounded-full bg-mulled-wine-700 hover:bg-mulled-wine-500 transition-colors" title="Restaurar por defecto">
          🔄
        </button>

        <button 
          v-for="emoji in emojiList" 
          :key="emoji"
          @click="$emit('select', emoji)"
          class="hover:scale-125 transition-transform cursor-pointer select-none"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['isOpen'])
defineEmits(['close', 'select'])

const emojiList = [
  '💪', '🦵', '🍑', '🏋️', '🧘', '🏃', '🤸', '🚴',
  '🔥', '⚡', '💣', '💯', '🏆', '🥇', '👑', '💎',
  '🦍', '🦈', '🦅', '🦁', '🦖', '🐂', '🐲', '🦄',
  '🍕', '🍔', '🥑', '🥩', '🥦', '🍌', '💊', '🩸',
  '💀', '☠️', '🛑', '🚧', '🚀', '🛸', '📅', '📝',
  '🔴', '🔵', '🟢', '🟡', '🟣', '⚫', '⚪', '🟧'
]
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
