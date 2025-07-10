import React from 'react'
import { useAppContext } from '../hooks/useAppContext'

function NotificationCenter() {
  const { state, actions } = useAppContext()

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-500/10 text-green-400'
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'info':
      default:
        return 'border-blue-500 bg-blue-500/10 text-blue-400'
    }
  }

  if (state.notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border backdrop-blur-sm shadow-lg transform transition-all duration-300 ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-sm mt-1 opacity-90">
                  {notification.message}
                </p>
              )}
            </div>
            
            <button
              onClick={() => actions.removeNotification(notification.id)}
              className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationCenter