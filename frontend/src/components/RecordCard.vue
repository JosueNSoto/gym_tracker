<template>
  <div 
    class="card-container !p-3 border-l-4 border-l-notify-warning flex flex-col gap-2"
    :class="{ 'min-h-[100px] max-h-[100px]': !showMedal }"
  >
    <!-- Icono/Medallita (opcional para vista de logros) - más pequeña -->
    <div v-if="showMedal" class="w-8 h-8 bg-gradient-to-br from-notify-warning to-mulled-wine-500 rounded-full flex items-center justify-center text-lg shadow-md">
      🏅
    </div>
    
    <!-- Nombre del ejercicio -->
    <p class="text-label leading-tight line-clamp-2" :class="{ 'mb-2': !showMedal, 'font-bold text-[11px] text-mulled-wine-50': showMedal }">
      {{ name }}
    </p>
    
    <!-- Peso y fecha -->
    <div class="flex items-end justify-between">
      <div>
        <p class="text-xl font-black text-mulled-wine-50 leading-none" :class="{ 'text-2xl': !showMedal }">{{ weight }}</p>
        <p class="text-[10px] text-mulled-wine-300 font-bold uppercase">kg · 1RM</p>
      </div>
      <p class="text-[10px] text-mulled-wine-300">{{ date }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  showMedal: {
    type: Boolean,
    default: false
  }
})
</script>
