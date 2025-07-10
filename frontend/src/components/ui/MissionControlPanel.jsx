import React from 'react'
import { clsx } from 'clsx'
import StatusIndicator from './StatusIndicator'

function MissionControlPanel({ 
  title,
  subtitle = null,
  status = 'operational',
  children,
  className = '',
  headerActions = null,
  ...props 
}) {
  return (
    <div 
      className={clsx(
        'card-mission border-l-4',
        status === 'operational' && 'border-l-green-500',
        status === 'warning' && 'border-l-yellow-500',
        status === 'error' && 'border-l-red-500',
        status === 'offline' && 'border-l-gray-500',
        className
      )}
      {...props}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-bold font-space text-white">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <StatusIndicator status={status} size="sm" />
        </div>
        
        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>
      
      {/* Panel Content */}
      <div>
        {children}
      </div>
    </div>
  )
}

function DataGrid({ data = [], columns = [], className = '', ...props }) {
  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📡</div>
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className={clsx('overflow-x-auto', className)} {...props}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((column, index) => (
              <th 
                key={index}
                className="text-left py-3 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-800/50 transition-colors">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="py-3 px-4 text-sm text-gray-300">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  unit = '', 
  trend = null, 
  icon = null,
  status = 'operational',
  className = '',
  ...props 
}) {
  const statusColors = {
    operational: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    offline: 'text-gray-400'
  }

  return (
    <div 
      className={clsx(
        'bg-gray-800/60 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className={clsx('text-2xl font-bold', statusColors[status])}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500">{unit}</span>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center mt-2 text-xs">
          <span className={clsx(
            'flex items-center',
            trend.direction === 'up' ? 'text-green-400' : 
            trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
          )}>
            {trend.direction === 'up' && '↗'}
            {trend.direction === 'down' && '↘'}
            {trend.direction === 'stable' && '→'}
            <span className="ml-1">{trend.value}</span>
          </span>
        </div>
      )}
    </div>
  )
}

function ControlButton({ 
  children, 
  active = false, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const variants = {
    default: 'bg-gray-700 hover:bg-gray-600 border-gray-600',
    primary: 'bg-space-600 hover:bg-space-500 border-space-500',
    danger: 'bg-red-600 hover:bg-red-500 border-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-500 border-yellow-500'
  }

  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg border font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-space-500/50',
        active && 'ring-2 ring-space-500/50 shadow-lg',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

MissionControlPanel.DataGrid = DataGrid
MissionControlPanel.MetricCard = MetricCard
MissionControlPanel.ControlButton = ControlButton

export default MissionControlPanel