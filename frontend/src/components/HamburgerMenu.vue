<template>
  <div>
    <!-- Icono Hamburguesa -->
    <button 
      @click="toggleMenu"
      class="fixed top-4 right-4 z-[60] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gym-dark hover:bg-gray-50 transition-colors active:scale-95"
      aria-label="Menú"
    >
      <svg 
        v-if="!menuOpen" 
        class="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg 
        v-else 
        class="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Overlay -->
    <Transition name="fade">
      <div 
        v-if="menuOpen"
        @click="closeMenu"
        class="fixed inset-0 bg-black/50 z-[55]"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Panel Deslizable -->
    <Transition name="slide">
      <div 
        v-if="menuOpen"
        class="fixed top-0 right-0 h-screen w-64 bg-white shadow-2xl z-[60] flex flex-col"
        @click.stop
      >
        <!-- Header del menú -->
        <div class="p-6 border-b border-gray-200">
          <h3 class="font-bold text-lg text-gym-dark mb-1">Mi Cuenta</h3>
          <p class="text-sm text-gym-muted truncate" v-if="auth.user">
            {{ auth.user.email }}
          </p>
        </div>

        <!-- Opciones del menú -->
        <nav class="flex-1 p-4">
          <ul class="space-y-2">
            <!-- Perfil (preparado para futuro) -->
            <li>
              <button 
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gym-dark"
                disabled
                title="Próximamente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="opacity-50">Mi Perfil</span>
              </button>
            </li>

            <!-- Configuración (preparado para futuro) -->
            <li>
              <button 
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-gym-dark"
                disabled
                title="Próximamente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="opacity-50">Configuración</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Separador y Logout -->
        <div class="p-4 border-t border-gray-200">
          <button 
            @click="handleLogout"
            class="w-full px-4 py-3 rounded-lg bg-red-50 hover:bg-red-500 transition-colors flex items-center gap-3 text-red-600 hover:text-white font-medium group"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Dialog de Confirmación -->
    <ConfirmDialog 
      v-if="showConfirmDialog"
      title="¿Cerrar sesión?"
      message="¿Estás seguro de que quieres cerrar sesión?"
      @confirm="confirmLogout"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import ConfirmDialog from './ConfirmDialog.vue'

const auth = useAuthStore()
const menuOpen = ref(false)
const showConfirmDialog = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const handleLogout = () => {
  console.log('🔴 HamburgerMenu: handleLogout - Mostrando diálogo de confirmación')
  showConfirmDialog.value = true
}

const confirmLogout = async () => {
  console.log('🔴 HamburgerMenu: confirmLogout - Usuario confirmó logout')
  showConfirmDialog.value = false
  closeMenu()
  console.log('🔴 HamburgerMenu: Llamando a auth.signOut()...')
  try {
    await auth.signOut()
    console.log('✅ HamburgerMenu: auth.signOut() completado')
  } catch (error) {
    console.error('❌ HamburgerMenu: Error en signOut:', error)
  }
}

// Prevenir scroll cuando el menú está abierto
watch(menuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Animación de fade para el overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación de slide para el panel */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
