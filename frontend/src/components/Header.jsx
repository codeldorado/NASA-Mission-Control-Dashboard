import React from 'react'
import { useAppContext } from '../hooks/useAppContext'
import StatusIndicator from './ui/StatusIndicator'
import Badge from './ui/Badge'

function Header({ onShowPerformance }) {
  const { state, actions } = useAppContext()

  const getStatusText = () => {
    if (!state.apiHealth) return 'Connecting...'
    return state.apiHealth.status === 'operational' ? 'OPERATIONAL' : 'OFFLINE'
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={actions.toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-space-500 to-cosmic-500 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">🚀</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-space gradient-text">
                  NASA MISSION CONTROL
                </h1>
                <p className="text-sm text-gray-400">Space Data Explorer</p>
              </div>
            </div>
          </div>

          {/* Center - Current time */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">MISSION TIME</div>
              <div className="font-mono text-lg font-semibold">
                {new Date().toLocaleTimeString('en-US', { 
                  hour12: false,
                  timeZone: 'UTC'
                })} UTC
              </div>
            </div>
          </div>

          {/* Right side - Status and controls */}
          <div className="flex items-center space-x-4">
            {/* API Status */}
            <StatusIndicator
              status={state.apiHealth?.status === 'operational' ? 'operational' : 'error'}
              label={getStatusText()}
              size="sm"
              showIcon={false}
            />

            {/* Notification count */}
            {state.notifications.length > 0 && (
              <Badge variant="error" size="sm">
                {state.notifications.length}
              </Badge>
            )}

            {/* Error indicator */}
            {state.error && (
              <button
                onClick={actions.clearError}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                title={state.error}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </button>
            )}

            {/* Performance monitor button (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => onShowPerformance?.(true)}
                title="Performance Monitor"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}


          </div>
        </div>
      </div>
    </header>
  )
}

export default Header