<template>
  <div class="min-h-screen bg-gunmetal flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-slate rounded-2xl mb-4 shadow-xl">
          <span class="text-4xl">💪</span>
        </div>
        <h1 class="text-4xl font-black text-platinum mb-2 tracking-tight">
          Gym Tracker
        </h1>
        <p class="text-silver text-sm">
          El límite lo pones tú
        </p>
      </div>

      <!-- Card de login -->
      <div class="bg-app-surface border border-app-border rounded-2xl p-8 shadow-xl">
        <!-- Tabs -->
        <div class="flex gap-2 mb-6 p-1 bg-gunmetal rounded-xl">
          <button 
            @click="isLogin = true"
            :class="isLogin ? 'bg-slate text-platinum shadow-md' : 'text-silver hover:text-platinum'"
            class="flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300"
          >
            Iniciar Sesión
          </button>
          <button 
            @click="isLogin = false"
            :class="!isLogin ? 'bg-slate text-platinum shadow-md' : 'text-silver hover:text-platinum'"
            class="flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300"
          >
            Registrarse
          </button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleAuth" class="space-y-5">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-semibold text-platinum mb-2">
              Email
            </label>
            <input 
              v-model="email" 
              id="email" 
              type="email" 
              required
              autocomplete="email"
              placeholder="tu@email.com"
              class="input-field"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-sm font-semibold text-platinum mb-2">
              Contraseña
            </label>
            <input 
              v-model="password" 
              id="password" 
              type="password" 
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="input-field"
            />
          </div>

          <!-- Botón Submit -->
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full mt-2 py-3.5 bg-steel text-platinum rounded-xl font-bold text-base shadow-lg hover:bg-slate hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="!loading">{{ isLogin ? 'Entrar' : 'Crear cuenta' }}</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </span>
          </button>
        </form>

        <!-- Toggle entre Login/Registro -->
        <p class="mt-6 text-center text-sm text-silver">
          {{ isLogin ? '¿Primera vez aquí?' : '¿Ya tienes cuenta?' }}
          <button 
            @click="isLogin = !isLogin" 
            class="font-bold text-platinum hover:text-steel ml-1 transition-colors"
          >
            {{ isLogin ? 'Regístrate gratis' : 'Inicia sesión' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../stores/notifications'

const auth = useAuthStore()
const { error: showError } = useNotifications()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleAuth = async () => {
  loading.value = true
  try {
    if (isLogin.value) {
      await auth.signIn(email.value, password.value)
    } else {
      await auth.signUp(email.value, password.value)
    }
  } catch (e) {
    // Mostrar error como notificación
    const errorMessage = e.message === 'Invalid login credentials' 
      ? 'Credenciales inválidas. Verifica tu email y contraseña.'
      : e.message
    showError(errorMessage, 'Error de autenticación')
  } finally {
    loading.value = false
  }
}
</script>
