<template>
  <div 
    class="skeleton-shimmer rounded-lg"
    :style="{ 
      height: height, 
      width: width,
      borderRadius: rounded 
    }"
  ></div>
</template>

<script setup>
defineProps({
  height: {
    type: String,
    default: '20px'
  },
  width: {
    type: String,
    default: '100%'
  },
  rounded: {
    type: String,
    default: '0.5rem'
  }
})
</script>
