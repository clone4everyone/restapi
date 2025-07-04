import { useNotification } from '../contexts/NotificationContext'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center justify-between p-4 rounded-lg border shadow-lg ${getBackgroundColor(notification.type)}`}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">{notification.message}</span>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer