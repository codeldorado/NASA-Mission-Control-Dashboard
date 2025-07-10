import React from 'react'
import { clsx } from 'clsx'

const badgeVariants = {
  operational: 'status-operational',
  warning: 'status-warning',
  error: 'status-error',
  loading: 'status-loading',
  info: 'bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium',
  success: 'bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium',
  secondary: 'bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-medium',
  outline: 'border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm font-medium'
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
}

function Badge({ 
  children, 
  variant = 'secondary', 
  size = 'md', 
  className = '',
  pulse = false,
  ...props 
}) {
  const variantClasses = badgeVariants[variant] || badgeVariants.secondary
  const sizeClasses = badgeSizes[size] || badgeSizes.md
  
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variantClasses,
        sizeClasses,
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge