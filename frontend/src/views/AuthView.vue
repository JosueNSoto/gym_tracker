<template>
  <div class="min-h-screen bg-gym-dark flex flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
        {{ isLogin ? 'Inicia Sesión' : 'Crea tu cuenta' }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <button @click="isLogin = !isLogin" class="font-semibold text-gym-primary hover:text-blue-400 ml-1">
          {{ isLogin ? 'Regístrate aquí' : 'Inicia sesión' }}
        </button>
      </p>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleAuth">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-white">Email</label>
          <div class="mt-2">
            <input v-model="email" id="email" name="email" type="email" autocomplete="email" required class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gym-primary sm:text-sm sm:leading-6 pl-3">
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium leading-6 text-white">Contraseña</label>
          <div class="mt-2">
            <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" required class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gym-primary sm:text-sm sm:leading-6 pl-3">
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading" class="flex w-full justify-center rounded-md bg-gym-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gym-primary disabled:opacity-50">
            {{ loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse') }}
          </button>
        </div>
        
        <p v-if="errorMsg" class="text-red-400 text-center text-sm">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleAuth = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    if (isLogin.value) {
      await auth.signIn(email.value, password.value)
    } else {
      await auth.signUp(email.value, password.value)
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
