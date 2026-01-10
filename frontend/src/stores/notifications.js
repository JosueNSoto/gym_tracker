import { ref } from 'vue'

const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  const addNotification = ({ 
    type = 'info', 
    title = '', 
    message = '', 
    duration = 3000 
  }) => {
    const id = notificationId++
    
    // Iconos según el tipo
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }

    const notification = {
      id,
      type,
      title,
      message,
      icon: icons[type] || icons.info,
      duration
    }

    notifications.value.push(notification)

    // Auto-remover después del duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Helpers para tipos específicos
  const success = (message, title = 'Éxito') => {
    return addNotification({ type: 'success', title, message })
  }

  const error = (message, title = 'Error') => {
    return addNotification({ type: 'error', title, message })
  }

  const warning = (message, title = 'Advertencia') => {
    return addNotification({ type: 'warning', title, message })
  }

  const info = (message, title = 'Información') => {
    return addNotification({ type: 'info', title, message })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }
}
