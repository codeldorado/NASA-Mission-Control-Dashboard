import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import NotificationCenter from './NotificationCenter'

import PerformanceMonitor from './ui/PerformanceMonitor'
import { useAppContext } from '../hooks/useAppContext'

function Layout({ children }) {
  const { state } = useAppContext()
  const location = useLocation()

  // Modal states for development tools
  const [showPerformance, setShowPerformance] = useState(false)

  return (
    <div className="min-h-screen bg-space-gradient">
      {/* Background grid pattern */}
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      
      {/* Header */}
      <Header
        onShowPerformance={setShowPerformance}
      />
      
      {/* Main content area */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            state.sidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter />
      
      {/* Loading overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="card-mission p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-space-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg font-medium">Mission Control Processing...</p>
          </div>
        </div>
      )}

      {/* Modal Components - Rendered at root level for proper positioning */}
      <PerformanceMonitor
        isVisible={showPerformance}
        onClose={() => setShowPerformance(false)}
      />
    </div>
  )
}

export default Layout