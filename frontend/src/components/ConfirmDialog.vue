<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
    <div class="bg-mulled-wine-600 border border-mulled-wine-500 w-full max-w-sm rounded-2xl shadow-2xl animate-scale-in">
      
      <!-- Header con icono -->
      <div class="p-6 pb-4 flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-full bg-mulled-wine-500/20 flex items-center justify-center mb-4">
          <span class="text-2xl">{{ icon }}</span>
        </div>
        <h3 class="font-bold text-xl text-mulled-wine-50 mb-2">{{ title }}</h3>
        <p class="text-sm text-mulled-wine-300">{{ message }}</p>
      </div>

      <!-- Botones -->
      <div class="p-4 pt-2 flex gap-3">
        <button 
          @click="handleCancel" 
          class="flex-1 py-3 px-4 rounded-xl font-bold text-mulled-wine-300 bg-mulled-wine-700 hover:bg-mulled-wine-500/50 transition-colors active:scale-95"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          class="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors active:scale-95"
          :class="danger ? 'bg-notify-error hover:bg-notify-error/80' : 'bg-mulled-wine-500 hover:bg-mulled-wine-400'"
        >
          {{ confirmText }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: '¿Estás seguro?'
  },
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '⚠️'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  danger: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { 
    transform: scale(0.9); 
    opacity: 0; 
  }
  to { 
    transform: scale(1); 
    opacity: 1; 
  }
}
</style>
