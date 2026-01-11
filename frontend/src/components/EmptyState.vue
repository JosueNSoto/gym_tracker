<template>
  <div 
    class="card-container flex flex-col items-center justify-center text-mulled-wine-300 text-center gap-2"
    :class="containerClass"
  >
    <span class="text-4xl" v-if="icon">{{ icon }}</span>
    <p class="font-semibold text-mulled-wine-50" v-if="title">{{ title }}</p>
    <p class="text-sm" v-if="description">{{ description }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '📦'
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: 'py-10'
  }
})
</script>
