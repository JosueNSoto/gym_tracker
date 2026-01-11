<template>
  <div class="card-container !p-2 !mb-0 border-l-4 border-l-mulled-wine-500 flex flex-col gap-1 min-w-[100px] w-full flex-grow sm:min-w-[110px] md:min-w-[120px] min-h-[120px] max-h-[120px]">
    <!-- Header: Nombre del ejercicio -->
    <div class="h-[32px] mb-1">
      <div class="skeleton-shimmer h-3 w-full rounded mb-1"></div>
      <div class="skeleton-shimmer h-3 w-3/4 rounded"></div>
    </div>
    
    <!-- Peso + kg -->
    <div class="skeleton-shimmer h-6 w-16 rounded mb-1"></div>
    
    <!-- 1RM -->
    <div class="skeleton-shimmer h-3 w-8 rounded"></div>
    
    <!-- Fecha -->
    <div class="skeleton-shimmer h-3 w-14 rounded"></div>
  </div>
</template>

<script setup>
// No props needed, este componente tiene tamaño fijo
</script>
