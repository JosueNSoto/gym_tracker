<template>
  <div class="card-container relative">
    <!-- Título del ejercicio -->
    <div class="skeleton-shimmer h-5 w-2/3 rounded mb-3"></div>

    <!-- Grid de 3 columnas (Series / Reps / Peso) -->
    <div class="grid grid-cols-3 gap-3">
      <div>
        <div class="skeleton-shimmer h-3 w-12 rounded mb-2"></div>
        <div class="skeleton-shimmer h-8 rounded"></div>
      </div>
      <div>
        <div class="skeleton-shimmer h-3 w-16 rounded mb-2"></div>
        <div class="skeleton-shimmer h-8 rounded"></div>
      </div>
      <div>
        <div class="skeleton-shimmer h-3 w-14 rounded mb-2"></div>
        <div class="skeleton-shimmer h-8 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props needed, este componente tiene tamaño fijo
</script>
