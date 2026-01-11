<template>
  <div 
    class="card-container !p-3 border-l-4 border-l-notify-warning flex flex-col gap-1 min-w-[100px] w-full sm:min-w-[110px] md:min-w-[120px]"
    :class="{ 'min-h-[120px] max-h-[120px]': !showMedal, 'min-h-[120px]': showMedal }"
  >
    <!-- Icono/Medallita (opcional para vista de logros) - más pequeña -->
    <div v-if="showMedal" class="w-8 h-8 bg-gradient-to-br from-notify-warning to-mulled-wine-500 rounded-full flex items-center justify-center text-lg shadow-md mb-1">
      🏅
    </div>
    
    <!-- Header: Nombre del ejercicio con altura fija -->
    <div class="h-[32px] mb-1">
      <p class="text-label leading-tight line-clamp-2" :class="{ 'font-bold text-[11px] text-mulled-wine-50': showMedal }">
        {{ name }}
      </p>
    </div>
    
    <!-- Peso + kg (misma línea) -->
    <div class="flex items-baseline gap-1">
      <p class="text-xl font-black text-mulled-wine-50 leading-none" :class="{ 'text-2xl': !showMedal }">
        {{ weight }}
      </p>
      <p class="text-[10px] text-mulled-wine-300 font-bold uppercase">
        kg
      </p>
    </div>
    
    <!-- 1RM (otra línea) -->
    <p class="text-[10px] text-mulled-wine-300 font-bold uppercase">
      1RM
    </p>
    
    <!-- Fecha -->
    <p class="text-[10px] text-mulled-wine-300 mt-0">
      {{ date }}
    </p>
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
