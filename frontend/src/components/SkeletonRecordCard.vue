<template>
  <div class="card-container !p-2 !mb-0 border-l-4 border-l-mulled-wine-500 flex flex-col gap-1 min-w-[100px] w-full flex-grow sm:min-w-[110px] md:min-w-[120px] min-h-[120px] max-h-[120px]">
    <!-- Header: Nombre del ejercicio -->
    <div class="h-[32px] sm:h-[36px] md:h-[40px]">
      <div class="skeleton-shimmer h-3 sm:h-4 md:h-5 w-full rounded mb-1"></div>
      <div class="skeleton-shimmer h-3 sm:h-4 md:h-5 w-3/4 rounded"></div>
    </div>
    
    <!-- Peso KG - 1RM (vertical en mobile, horizontal en md+) -->
    <div class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-0 md:gap-2 mb-1">
      <div class="skeleton-shimmer h-6 sm:h-8 md:h-10 w-16 sm:w-20 md:w-24 rounded mb-1 md:mb-0"></div>
      <div class="skeleton-shimmer h-3 sm:h-4 md:h-5 w-8 sm:w-10 md:w-12 rounded"></div>
    </div>
    
    <!-- Fecha -->
    <div class="skeleton-shimmer h-3 sm:h-4 w-14 sm:w-16 rounded"></div>
  </div>
</template>

<script setup>
// No props needed, este componente tiene tamaño fijo
</script>
