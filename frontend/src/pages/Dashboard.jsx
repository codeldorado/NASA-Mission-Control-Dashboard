import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../hooks/useAppContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import StatusIndicator from '../components/ui/StatusIndicator'
import MissionControlPanel from '../components/ui/MissionControlPanel'

function Dashboard() {
  const { state, actions, api } = useAppContext()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    actions.setCurrentPage('dashboard')

    // Load initial data
    const loadDashboardData = async () => {
      try {
        await Promise.allSettled([
          api.fetchApodToday(),
          api.fetchMarsRovers(),
          api.fetchAsteroidsToday(),
          api.fetchEarthImages()
        ])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await api.checkHealth()
      actions.addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'All systems updated successfully'
      })
    } catch (error) {
      actions.addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: error.message
      })
    } finally {
      setRefreshing(false)
    }
  }

  const systemMetrics = [
    {
      title: 'API Status',
      value: state.apiHealth?.status || 'Unknown',
      icon: '🛰️',
      status: state.apiHealth?.status === 'operational' ? 'operational' : 'error',
      unit: ''
    },
    {
      title: 'Cache Performance',
      value: state.apiHealth?.cache?.keys || 0,
      icon: '💾',
      status: 'operational',
      unit: 'keys',
      trend: state.apiHealth?.cache?.hitRate ? {
        direction: state.apiHealth.cache.hitRate > 0.8 ? 'up' : 'stable',
        value: `${Math.round(state.apiHealth.cache.hitRate * 100)}% hit rate`
      } : null
    },
    {
      title: 'System Uptime',
      value: state.apiHealth?.uptime ? Math.floor(state.apiHealth.uptime / 60) : 0,
      icon: '⏱️',
      status: 'operational',
      unit: 'min'
    },
    {
      title: 'Active Alerts',
      value: state.notifications.length,
      icon: '🔔',
      status: state.notifications.length > 0 ? 'warning' : 'operational',
      unit: ''
    }
  ]

  const missionModules = [
    {
      title: 'Astronomy Picture of the Day',
      description: 'Explore daily featured space imagery and discoveries',
      path: '/apod',
      icon: '🌌',
      status: state.apodData ? 'Ready' : 'Loading...',
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      title: 'Mars Exploration',
      description: 'Browse photos from NASA Mars rovers',
      path: '/mars',
      icon: '🔴',
      status: state.marsData.rovers.length > 0 ? 'Ready' : 'Loading...',
      gradient: 'from-red-600 to-orange-600'
    },
    {
      title: 'Asteroid Tracking',
      description: 'Monitor near-Earth objects and potential threats',
      path: '/asteroids',
      icon: '☄️',
      status: state.asteroidsData.feed ? 'Ready' : 'Loading...',
      gradient: 'from-yellow-600 to-red-600'
    },
    {
      title: 'Earth Observation',
      description: 'View Earth from space with EPIC imagery',
      path: '/earth',
      icon: '🌍',
      status: state.earthData.images.length > 0 ? 'Ready' : 'Loading...',
      gradient: 'from-green-600 to-blue-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Mission Control Header */}
      <MissionControlPanel
        title="NASA MISSION CONTROL DASHBOARD"
        subtitle="Space Exploration Command Center"
        status={state.apiHealth?.status === 'operational' ? 'operational' : 'warning'}
        headerActions={
          <Button
            onClick={handleRefresh}
            loading={refreshing}
            icon="🔄"
            size="sm"
          >
            Refresh Systems
          </Button>
        }
      >
        <div className="text-center py-4">
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Monitor real-time data from NASA's Open APIs and explore the wonders of our universe.
            All systems are {state.apiHealth?.status === 'operational' ? 'operational' : 'under maintenance'}.
          </p>
        </div>
      </MissionControlPanel>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <MissionControlPanel.MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            icon={metric.icon}
            status={metric.status}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* Mission Modules */}
      <MissionControlPanel
        title="MISSION MODULES"
        subtitle="Space Exploration Systems"
        status="operational"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missionModules.map((module, index) => (
            <Card key={index} variant="elevated" className="group">
              <Link to={module.path} className="block">
                <div className={`w-full h-32 bg-gradient-to-br ${module.gradient} rounded-lg mb-4 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300`}>
                  {module.icon}
                </div>

                <Card.Header>
                  <Card.Title className="group-hover:text-space-400 transition-colors">
                    {module.title}
                  </Card.Title>
                  <Card.Description>
                    {module.description}
                  </Card.Description>
                </Card.Header>

                <Card.Footer className="border-t-0 pt-0">
                  <div className="flex items-center justify-between w-full">
                    <Badge
                      variant={module.status === 'Ready' ? 'success' : 'warning'}
                    >
                      {module.status}
                    </Badge>

                    <svg className="w-5 h-5 text-gray-400 group-hover:text-space-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card.Footer>
              </Link>
            </Card>
          ))}
        </div>
      </MissionControlPanel>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <MissionControlPanel
          title="RECENT ACTIVITY"
          subtitle="Mission Log"
          status="operational"
        >
          <div className="space-y-3">
            {state.notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <Badge
                  variant={notification.type === 'success' ? 'success' :
                          notification.type === 'error' ? 'error' :
                          notification.type === 'warning' ? 'warning' : 'info'}
                  size="sm"
                >
                  {notification.type === 'success' ? '✅' :
                   notification.type === 'error' ? '❌' :
                   notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{notification.title}</p>
                  {notification.message && (
                    <p className="text-sm text-gray-400 truncate">{notification.message}</p>
                  )}
                </div>
              </div>
            ))}

            {state.notifications.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📡</div>
                <p>All systems nominal</p>
              </div>
            )}
          </div>
        </MissionControlPanel>

        {/* System Status */}
        <MissionControlPanel
          title="SYSTEM STATUS"
          subtitle="Mission Critical Systems"
          status="operational"
        >
          <StatusIndicator.SystemStatus
            systems={[
              {
                name: 'NASA API Gateway',
                status: state.apiHealth?.services?.nasa_api === 'operational' ? 'operational' : 'error',
                label: state.apiHealth?.services?.nasa_api || 'Unknown'
              },
              {
                name: 'Cache System',
                status: 'operational',
                label: `${state.apiHealth?.cache?.keys || 0} keys`
              },
              {
                name: 'Data Processing',
                status: 'operational',
                label: 'Active'
              },
              {
                name: 'User Interface',
                status: 'operational',
                label: 'Responsive'
              }
            ]}
          />
        </MissionControlPanel>
      </div>

      {/* System Information */}
      {state.apiHealth && (
        <MissionControlPanel
          title="SYSTEM INFORMATION"
          subtitle="Mission Control Diagnostics"
          status="operational"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MissionControlPanel.MetricCard
              title="Environment"
              value={state.apiHealth.environment}
              icon="🌍"
              status="operational"
            />
            <MissionControlPanel.MetricCard
              title="Version"
              value={state.apiHealth.version}
              icon="🚀"
              status="operational"
            />
            <MissionControlPanel.MetricCard
              title="Last Updated"
              value={new Date(state.apiHealth.timestamp).toLocaleTimeString()}
              icon="⏰"
              status="operational"
            />
          </div>
        </MissionControlPanel>
      )}
    </div>
  )
}

export default Dashboard