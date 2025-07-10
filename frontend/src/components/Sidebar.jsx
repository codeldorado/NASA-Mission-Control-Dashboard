import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppContext } from '../hooks/useAppContext'
import Badge from './ui/Badge'
import StatusIndicator from './ui/StatusIndicator'

const navigationItems = [
  {
    name: 'Mission Control',
    path: '/',
    icon: '🎛️',
    description: 'Main Dashboard'
  },
  {
    name: 'Astronomy Picture',
    path: '/apod',
    icon: '🌌',
    description: 'Picture of the Day'
  },
  {
    name: 'Mars Explorer',
    path: '/mars',
    icon: '🔴',
    description: 'Rover Photos'
  },
  {
    name: 'Asteroid Tracker',
    path: '/asteroids',
    icon: '☄️',
    description: 'Near Earth Objects'
  },
  {
    name: 'Earth Observation',
    path: '/earth',
    icon: '🌍',
    description: 'EPIC Imagery'
  }
]

function Sidebar() {
  const { state } = useAppContext()
  const location = useLocation()

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900/90 backdrop-blur-sm border-r border-gray-700 transition-all duration-300 z-30 ${
        state.sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4">
        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path === '/' && location.pathname === '/dashboard')
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                  state.sidebarOpen ? 'space-x-3' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-space-600/50 text-space-200 border border-space-500/50'
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                }`}
                title={!state.sidebarOpen ? item.name : ''}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>

                {state.sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-gray-400 truncate">{item.description}</div>
                  </div>
                )}

                {isActive && state.sidebarOpen && (
                  <div className="w-2 h-2 bg-space-400 rounded-full flex-shrink-0" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Divider */}
        {state.sidebarOpen && (
          <div className="my-6 border-t border-gray-700" />
        )}

        {/* System Status */}
        {state.sidebarOpen && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              System Status
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">API Health</span>
                <Badge
                  variant={state.apiHealth?.status === 'operational' ? 'success' : 'error'}
                  size="sm"
                >
                  {state.apiHealth?.status || 'Unknown'}
                </Badge>
              </div>
              
              {state.apiHealth?.uptime && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-gray-300">
                    {Math.floor(state.apiHealth.uptime / 60)}m
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Cache</span>
                <span className="text-gray-300">
                  {state.apiHealth?.cache?.keys || 0} keys
                </span>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Footer */}
      {state.sidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 text-center">
            <div>NASA Mission Control</div>
            <div>v1.0.0</div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar