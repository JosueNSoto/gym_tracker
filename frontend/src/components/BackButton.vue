<template>
  <button 
    @click="handleClick" 
    class="text-mulled-wine-400 hover:text-mulled-wine-50 transition-colors active:scale-95"
    :class="customClass"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    default: null
  },
  customClass: {
    type: String,
    default: ''
  }
})

const router = useRouter()

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    router.back()
  }
}
</script>
