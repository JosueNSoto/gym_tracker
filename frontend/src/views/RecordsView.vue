<template>
  <div class="view-container">
    <h1 class="heading-1">🏆 Mis Logros</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="space-y-3">
        <!-- Skeleton Header -->
        <div class="sticky top-0 bg-mulled-wine-700 pt-2 pb-2 z-10">
          <div class="skeleton-shimmer h-7 w-20 rounded mb-1"></div>
          <div class="skeleton-shimmer h-4 w-24 rounded"></div>
        </div>
        
        <!-- Skeleton Grid -->
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          <SkeletonRecordCard v-for="j in 6" :key="j" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="groupedRecords.length === 0"
      icon="🏆"
      title="Aún no tienes logros."
      description="¡Entrena duro para ver tus récords aquí!"
    />

    <!-- Data -->
    <div v-else class="space-y-6">
      <!-- Grupo por Año/Mes -->
      <div v-for="group in groupedRecords" :key="group.key" class="space-y-3">
        <!-- Cabecera de Año -->
        <div class="sticky top-0 bg-mulled-wine-700 pt-2 pb-2 z-10">
          <h2 class="text-xl font-black text-mulled-wine-50">{{ group.year }}</h2>
          <p class="text-sm font-bold text-mulled-wine-400 uppercase">{{ group.month }}</p>
        </div>
        
        <!-- Grid de Medallitas -->
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          <RecordCard
            v-for="record in group.records" 
            :key="record.id"
            :name="record.name"
            :weight="record.weight"
            :date="record.displayDate"
            :show-medal="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/auth'
import RecordCard from '../components/RecordCard.vue'
import EmptyState from '../components/EmptyState.vue'
import SkeletonRecordCard from '../components/SkeletonRecordCard.vue'

const auth = useAuthStore()
const loading = ref(true)
const records = ref([])

// Agregar datos de prueba para diferentes meses y años
const addTestRecords = () => {
  const testData = [
    // 2026
    { name: 'Sentadilla con Barra', weight: 140, date: '2026-01-05', reps: 5 },
    { name: 'Press de Banca', weight: 100, date: '2026-01-03', reps: 3 },
    
    // Diciembre 2025
    { name: 'Peso Muerto', weight: 160, date: '2025-12-28', reps: 4 },
    { name: 'Press Militar', weight: 65, date: '2025-12-15', reps: 6 },
    
    // Noviembre 2025
    { name: 'Dominadas', weight: 25, date: '2025-11-20', reps: 8 },
    { name: 'Remo con Barra', weight: 90, date: '2025-11-10', reps: 5 },
    
    // Octubre 2025
    { name: 'Hip Thrust', weight: 180, date: '2025-10-15', reps: 6 },
    { name: 'Curl de Bíceps', weight: 40, date: '2025-10-05', reps: 10 },
    
    // Septiembre 2025
    { name: 'Extensión de Tríceps', weight: 50, date: '2025-09-22', reps: 8 },
    { name: 'Press Inclinado', weight: 85, date: '2025-09-10', reps: 5 },
    
    // Agosto 2025
    { name: 'Zancadas', weight: 70, date: '2025-08-18', reps: 10 },
    { name: 'Elevaciones Laterales', weight: 20, date: '2025-08-05', reps: 12 },
  ]
  
  return testData.map((r, idx) => {
    const dateObj = new Date(r.date)
    const est1RM = Math.round(r.weight * (1 + 0.0333 * r.reps))
    
    return {
      id: `test-${idx}`,
      name: r.name,
      weight: est1RM,
      dateObj: dateObj,
      timestamp: dateObj.getTime(),
      displayDate: formatDisplayDate(dateObj),
      year: dateObj.getFullYear(),
      month: dateObj.getMonth(),
      monthName: getMonthName(dateObj.getMonth())
    }
  })
}

const formatDisplayDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

const getMonthName = (monthIndex) => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[monthIndex]
}

// Agrupar récords por año y mes
const groupedRecords = computed(() => {
  if (records.value.length === 0) return []
  
  // Ordenar por fecha descendente (más nuevo primero)
  const sorted = [...records.value].sort((a, b) => b.timestamp - a.timestamp)
  
  // Agrupar por año y mes
  const groups = {}
  sorted.forEach(record => {
    const key = `${record.year}-${record.month}`
    if (!groups[key]) {
      groups[key] = {
        key,
        year: record.year,
        month: record.monthName,
        yearMonth: record.year * 100 + record.month, // Para ordenar
        records: []
      }
    }
    groups[key].records.push(record)
  })
  
  // Convertir a array y ordenar por año/mes descendente
  return Object.values(groups).sort((a, b) => b.yearMonth - a.yearMonth)
})

onMounted(async () => {
  try {
    const { data: sets } = await supabase
      .from('workout_sets')
      .select('weight, reps, created_at, exercises(name)')
      .eq('weight_unit', 'kg')
      .order('created_at', { ascending: false })

    if (!sets || sets.length === 0) {
      // Si no hay datos reales, usar datos de prueba
      records.value = addTestRecords()
      loading.value = false
      return
    }

    const bestRecords = {}

    // Calcular 1RM para cada set y guardar el mejor por ejercicio
    sets.forEach(s => {
      if (!s.exercises) return
      
      // Fórmula Epley: Peso * (1 + 0.0333 * Reps)
      const est1RM = Math.round(s.weight * (1 + 0.0333 * s.reps))
      const name = s.exercises.name
      const dateObj = new Date(s.created_at)

      if (!bestRecords[name] || est1RM > bestRecords[name].weight) {
        bestRecords[name] = {
          id: `real-${name}`,
          weight: est1RM,
          name: name,
          dateObj: dateObj,
          timestamp: dateObj.getTime(),
          displayDate: formatDisplayDate(dateObj),
          year: dateObj.getFullYear(),
          month: dateObj.getMonth(),
          monthName: getMonthName(dateObj.getMonth())
        }
      }
    })

    // Convertir objeto a array
    const realRecords = Object.values(bestRecords)
    
    // Combinar con datos de prueba (opcional: comentar esta línea para usar solo datos reales)
    records.value = [...realRecords, ...addTestRecords()]

  } catch (e) {
    console.error(e)
    // En caso de error, mostrar datos de prueba
    records.value = addTestRecords()
  } finally {
    loading.value = false
  }
})
</script>
