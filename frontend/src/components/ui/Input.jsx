import React from 'react'
import { clsx } from 'clsx'

function Input({ 
  label = null,
  error = null,
  icon = null,
  className = '',
  containerClassName = '',
  ...props 
}) {
  const inputClasses = clsx(
    'input-mission',
    icon && 'pl-10',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    className
  )

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

function Select({ 
  label = null,
  error = null,
  children,
  className = '',
  containerClassName = '',
  ...props 
}) {
  const selectClasses = clsx(
    'input-mission appearance-none bg-gray-800 cursor-pointer',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    className
  )

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select className={selectClasses} {...props}>
          {children}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

Input.Select = Select

export default Input