import React from 'react'

function LoadingSpinner({ size = 'lg', message = 'Loading mission data...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-gray-700 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-space-500 rounded-full animate-spin" />
        </div>
        
        {/* Inner ring */}
        <div className={`absolute inset-2 border-2 border-gray-600 rounded-full animate-spin`} style={{ animationDirection: 'reverse' }}>
          <div className="absolute inset-0 border-2 border-transparent border-t-cosmic-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-space-400 rounded-full animate-pulse" />
        </div>
      </div>
      
      {message && (
        <p className="mt-4 text-gray-300 text-center font-medium">
          {message}
        </p>
      )}
      
      {/* Mission control style dots */}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-space-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-space-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 bg-space-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  )
}

export default LoadingSpinner