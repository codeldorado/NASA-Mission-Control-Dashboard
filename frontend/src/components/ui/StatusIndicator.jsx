import React from 'react'
import { clsx } from 'clsx'

const statusConfig = {
  operational: {
    color: 'bg-green-500',
    textColor: 'text-green-400',
    label: 'OPERATIONAL',
    icon: '✅',
    pulse: true
  },
  warning: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    label: 'WARNING',
    icon: '⚠️',
    pulse: true
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-400',
    label: 'ERROR',
    icon: '❌',
    pulse: true
  },
  offline: {
    color: 'bg-gray-500',
    textColor: 'text-gray-400',
    label: 'OFFLINE',
    icon: '⭕',
    pulse: false
  },
  loading: {
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    label: 'LOADING',
    icon: '🔄',
    pulse: true
  },
  maintenance: {
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
    label: 'MAINTENANCE',
    icon: '🔧',
    pulse: true
  }
}

function StatusIndicator({ 
  status = 'offline', 
  label = null,
  showIcon = true,
  showLabel = true,
  size = 'md',
  className = '',
  ...props 
}) {
  const config = statusConfig[status] || statusConfig.offline
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className={clsx('flex items-center space-x-2', className)} {...props}>
      {/* Status dot */}
      <div className="relative">
        <div 
          className={clsx(
            'rounded-full',
            config.color,
            sizeClasses[size],
            config.pulse && 'animate-pulse'
          )}
        />
        {config.pulse && (
          <div 
            className={clsx(
              'absolute inset-0 rounded-full animate-ping',
              config.color,
              'opacity-75'
            )}
          />
        )}
      </div>
      
      {/* Icon */}
      {showIcon && (
        <span className={textSizeClasses[size]}>{config.icon}</span>
      )}
      
      {/* Label */}
      {showLabel && (
        <span className={clsx(
          'font-medium font-mono tracking-wider',
          config.textColor,
          textSizeClasses[size]
        )}>
          {label || config.label}
        </span>
      )}
    </div>
  )
}

function SystemStatus({ systems = [], className = '', ...props }) {
  return (
    <div className={clsx('space-y-3', className)} {...props}>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        System Status
      </h3>
      
      <div className="space-y-2">
        {systems.map((system, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{system.name}</span>
            <StatusIndicator 
              status={system.status} 
              label={system.label}
              size="sm"
              showIcon={false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

StatusIndicator.SystemStatus = SystemStatus

export default StatusIndicator