import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  // Inicializar sesión
  const initialize = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null
    loading.value = false

    // Escuchar cambios
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
      if (!user.value) {
        router.push('/auth')
      }
    })
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    router.push('/')
  }

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    alert('¡Registro exitoso! Revisa tu correo para confirmar.')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return { user, loading, initialize, signIn, signUp, signOut }
})
