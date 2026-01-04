<template>
  <div class="view-container">
    <h1 class="heading-1">Mis Récords Personales</h1>
    
    <div v-if="loading" class="text-center text-gym-muted py-10">
      Cargando récords...
    </div>

    <div v-else-if="records.length === 0" class="card-container flex flex-col items-center justify-center py-10 text-gym-muted text-center gap-2">
      <span class="text-4xl">🏆</span>
      <p>Aún no tienes registros.</p>
      <p class="text-sm">¡Entrena duro para ver tus números aquí!</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-3">
      <div v-for="record in records" :key="record.name" class="card-container !p-4 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-gym-dark">{{ record.name }}</h3>
          <p class="text-xs text-gym-muted">{{ record.date }}</p>
        </div>
        <div class="text-right">
          <span class="block text-2xl font-black text-gym-primary">{{ record.weight }} <span class="text-xs font-normal">kg</span></span>
          <span class="text-[10px] text-gym-muted font-bold uppercase">1RM Est.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const loading = ref(true)
const records = ref([])

onMounted(async () => {
  try {
    const { data: sets } = await supabase
      .from('workout_sets')
      .select('weight, reps, created_at, exercises(name)')
      .eq('weight_unit', 'kg')
      .order('created_at', { ascending: false }) // Más recientes primero por defecto

    if (!sets) return

    const bestRecords = {}

    // Calcular 1RM para cada set y guardar el mejor por ejercicio
    sets.forEach(s => {
      if (!s.exercises) return
      
      // Fórmula Epley: Peso * (1 + 0.0333 * Reps)
      // Si reps es 1, es Peso real.
      const est1RM = Math.round(s.weight * (1 + 0.0333 * s.reps))
      const name = s.exercises.name

      if (!bestRecords[name] || est1RM > bestRecords[name].weight) {
        bestRecords[name] = {
          weight: est1RM,
          date: new Date(s.created_at).toLocaleDateString(),
          name: name
        }
      }
    })

    // Convertir objeto a array y ordenar por peso
    records.value = Object.values(bestRecords).sort((a, b) => b.weight - a.weight)

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>