<template>
  <div class="card-container !p-2 !mb-0 flex flex-col items-center justify-center gap-1 min-w-[100px] flex-shrink-0 sm:min-w-[110px] md:min-w-[120px] min-h-[120px] max-h-[120px] shadow-sm">
    <!-- Círculo con icono -->
    <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 skeleton-shimmer rounded-full"></div>
    
    <!-- Texto (músculo) -->
    <div class="skeleton-shimmer h-3 sm:h-4 md:h-5 w-16 sm:w-20 md:w-24 rounded"></div>
    
    <!-- Fecha DD/MM/AA -->
    <div class="skeleton-shimmer h-3 sm:h-4 w-14 sm:w-16 rounded"></div>
    
    <!-- Duración (solo visible en md+) -->
    <div class="hidden md:block skeleton-shimmer h-3 md:h-4 w-10 md:w-12 rounded"></div>
  </div>
</template>

<script setup>
// No props needed, este componente tiene tamaño fijo
</script>
