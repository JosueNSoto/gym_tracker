import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import router from '../router'
import { useNotifications } from './notifications'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const { success } = useNotifications()

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
    success('Revisa tu correo para confirmar tu cuenta', '¡Registro exitoso!')
  }

  const signOut = async () => {
    console.log('🔴 AuthStore: signOut - Iniciando cierre de sesión...')
    console.log('🔴 AuthStore: Usuario actual:', user.value?.email)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ AuthStore: Error en supabase.auth.signOut():', error)
        throw error
      }
      console.log('✅ AuthStore: supabase.auth.signOut() exitoso')
      console.log('🔴 AuthStore: Redirigiendo a /auth...')
      router.push('/auth')
      console.log('✅ AuthStore: Redirección completada')
    } catch (error) {
      console.error('❌ AuthStore: Error general en signOut:', error)
      throw error
    }
  }

  return { user, loading, initialize, signIn, signUp, signOut }
})
