<template>
  <div>
    <!-- Icono Hamburguesa -->
    <button 
      @click="toggleMenu"
      class="fixed top-4 right-4 z-[60] w-10 h-10 bg-mulled-wine-600 rounded-full shadow-lg flex items-center justify-center text-mulled-wine-50 hover:bg-mulled-wine-500 transition-colors active:scale-95"
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
        class="fixed top-0 right-0 h-screen w-64 bg-mulled-wine-700 shadow-2xl z-[60] flex flex-col border-l border-mulled-wine-500"
        @click.stop
      >
        <!-- Header del menú -->
        <div class="p-4 border-b border-mulled-wine-500">
          <h3 class="font-bold text-base text-mulled-wine-50 mb-1">Mi Cuenta</h3>
          <p class="text-xs text-mulled-wine-300 truncate" v-if="auth.user">
            {{ auth.user.email }}
          </p>
        </div>

        <!-- Opciones del menú -->
        <nav class="flex-1 p-4">
          <ul class="space-y-2">
            <!-- Perfil (preparado para futuro) -->
            <li>
              <button 
                class="w-full text-left px-3 py-2.5 rounded-lg hover:bg-mulled-wine-600 transition-colors flex items-center gap-3 text-mulled-wine-300"
                disabled
                title="Próximamente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="opacity-50 text-sm">Mi Perfil</span>
              </button>
            </li>

            <!-- Configuración (preparado para futuro) -->
            <li>
              <button 
                class="w-full text-left px-3 py-2.5 rounded-lg hover:bg-mulled-wine-600 transition-colors flex items-center gap-3 text-mulled-wine-300"
                disabled
                title="Próximamente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="opacity-50 text-sm">Configuración</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Footer con Logout (misma altura que navbar) -->
        <div class="p-4 border-t border-mulled-wine-500 flex items-center">
          <button 
            @click="handleLogout"
            class="w-full py-2 px-3 rounded-lg bg-notify-error/10 text-notify-error hover:bg-notify-error hover:text-white transition-colors active:scale-95 font-semibold flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Dialog de Confirmación -->
    <ConfirmDialog 
      :isOpen="showConfirmDialog"
      title="¿Cerrar sesión?"
      message="¿Estás seguro de que quieres cerrar sesión?"
      icon="🚪"
      danger
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
  showConfirmDialog.value = true
}

const confirmLogout = async () => {
  showConfirmDialog.value = false
  closeMenu()
  try {
    await auth.signOut()
  } catch (error) {
    console.error('Error en signOut:', error)
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
