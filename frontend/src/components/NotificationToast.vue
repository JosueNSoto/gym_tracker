<template>
  <div class="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-in"
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
            <h4 class="font-bold text-sm text-gym-dark mb-0.5">
              {{ notification.title }}
            </h4>
            <p class="text-xs text-gym-muted leading-relaxed">
              {{ notification.message }}
            </p>
          </div>

          <!-- Botón cerrar -->
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center active:scale-95"
          >
            <span class="text-gray-400 text-sm">✕</span>
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
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-yellow-500',
    info: 'border-l-4 border-blue-500'
  }
  return classes[type] || classes.info
}

const getIconBgClass = (type) => {
  const classes = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100'
  }
  return classes[type] || classes.info
}

const getProgressBarClass = (type) => {
  const classes = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    warning: 'from-yellow-500 to-yellow-600',
    info: 'from-blue-500 to-blue-600'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

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
