<template>
  <div class="card-container !p-2 !mb-0 flex flex-col items-center justify-center gap-1 min-w-[100px] flex-shrink-0 flex-grow sm:min-w-[110px] md:min-w-[120px] min-h-[120px] max-h-[120px] shadow-sm">
    <!-- Círculo con icono -->
    <div class="w-10 h-10 skeleton-shimmer rounded-full"></div>
    
    <!-- Texto (músculo) -->
    <div class="skeleton-shimmer h-3 w-16 rounded"></div>
    
    <!-- Fecha DD/MM/AA -->
    <div class="skeleton-shimmer h-3 w-14 rounded"></div>
  </div>
</template>

<script setup>
// No props needed, este componente tiene tamaño fijo
</script>
