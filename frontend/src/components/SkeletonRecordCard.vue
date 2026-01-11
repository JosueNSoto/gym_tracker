<template>
  <div class="flex flex-col items-center gap-2 p-3 bg-mulled-wine-600 rounded-xl border border-mulled-wine-500">
    <!-- Medalla circular -->
    <div class="w-12 h-12 skeleton-shimmer rounded-full"></div>
    
    <!-- Nombre del ejercicio -->
    <div class="skeleton-shimmer h-3 w-20 rounded"></div>
    
    <!-- Peso -->
    <div class="skeleton-shimmer h-5 w-16 rounded"></div>
    
    <!-- Fecha -->
    <div class="skeleton-shimmer h-2 w-14 rounded"></div>
  </div>
</template>

<script setup>
// No props needed, este componente tiene tamaño fijo
</script>
