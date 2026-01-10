<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
    <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl animate-scale-in">
      
      <!-- Header con icono -->
      <div class="p-6 pb-4 flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-full bg-gym-primary/10 flex items-center justify-center mb-4">
          <span class="text-2xl">{{ icon }}</span>
        </div>
        <h3 class="font-bold text-xl text-gym-dark mb-2">{{ title }}</h3>
        <p class="text-sm text-gym-muted">{{ message }}</p>
      </div>

      <!-- Botones -->
      <div class="p-4 pt-2 flex gap-3">
        <button 
          @click="handleCancel" 
          class="flex-1 py-3 px-4 rounded-xl font-bold text-gym-muted bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          class="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gym-primary hover:bg-gym-secondary transition-colors active:scale-95"
          :class="danger ? 'bg-red-500 hover:bg-red-600' : 'bg-gym-primary hover:bg-gym-secondary'"
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
