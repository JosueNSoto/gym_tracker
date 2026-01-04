<template>
  <div class="w-full h-full flex items-center justify-center text-xl">
    {{ emoji }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['muscle'])

const emoji = computed(() => {
  const m = props.muscle?.toLowerCase() || ''
  
  if (m.includes('full body') || m.includes('completo')) return '🌐'
  if (m.includes('upper body') || m.includes('torso')) return '👕'
  if (m.includes('lower body') || m.includes('pierna')) return '🦵'
  if (m.includes('pecho')) return '🎯'
  if (m.includes('espalda')) return '🛡️'
  if (m.includes('brazos') || m.includes('bíceps') || m.includes('tríceps')) return '💪'
  if (m.includes('hombros')) return '🦾'
  if (m.includes('glúteo') || m.includes('gluteo')) return '🍑'
  if (m.includes('abs') || m.includes('abdomen')) return '🍫'
  
  return '🏋️'
})
</script>