import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now()
    const notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])

    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const value = {
    notifications,
    showNotification,
    removeNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}