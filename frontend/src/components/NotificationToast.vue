<template>
  <div class="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="bg-mulled-wine-600 border border-mulled-wine-500 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-in"
        :class="getNotificationClass(notification.type)"
      >
        <!-- Contenido -->
        <div class="p-4 flex items-start gap-3">
          <!-- Icono -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="getIconBgClass(notification.type)"
          >
            <span class="text-lg">{{ notification.icon }}</span>
          </div>

          <!-- Texto -->
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm text-mulled-wine-50 mb-0.5">
              {{ notification.title }}
            </h4>
            <p class="text-xs text-mulled-wine-300 leading-relaxed">
              {{ notification.message }}
            </p>
          </div>

          <!-- Botón cerrar -->
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 w-6 h-6 rounded-full bg-notify-error/10 text-notify-error hover:bg-notify-error hover:text-white transition-colors flex items-center justify-center active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Barra de progreso -->
        <div
          v-if="notification.duration > 0"
          class="h-1 bg-gradient-to-r"
          :class="getProgressBarClass(notification.type)"
          :style="{ animation: `shrink ${notification.duration}ms linear` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotifications } from '../stores/notifications'

const { notifications, removeNotification } = useNotifications()

const getNotificationClass = (type) => {
  const classes = {
    success: 'border-l-4 border-notify-success',
    error: 'border-l-4 border-notify-error',
    warning: 'border-l-4 border-notify-warning',
    info: 'border-l-4 border-mulled-wine-400'
  }
  return classes[type] || classes.info
}

const getIconBgClass = (type) => {
  const classes = {
    success: 'bg-notify-success/20',
    error: 'bg-notify-error/20',
    warning: 'bg-notify-warning/20',
    info: 'bg-mulled-wine-500/20'
  }
  return classes[type] || classes.info
}

const getProgressBarClass = (type) => {
  const classes = {
    success: 'from-notify-success to-notify-success/80',
    error: 'from-notify-error to-notify-error/80',
    warning: 'from-notify-warning to-notify-warning/80',
    info: 'from-mulled-wine-500 to-mulled-wine-400'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transiciones para TransitionGroup */
.notification-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-leave-active {
  transition: all 0.2s ease-out;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
