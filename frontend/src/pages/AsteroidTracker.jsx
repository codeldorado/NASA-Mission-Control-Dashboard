import React, { useEffect, useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import MissionControlPanel from '../components/ui/MissionControlPanel'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { AsteroidThreatChart, AsteroidSizeDistribution, AsteroidVelocityChart } from '../components/charts/AsteroidChart'
import { apiService } from '../services/api'

function AsteroidTracker() {
  const { state, actions, api } = useAppContext()
  const [hazardousAsteroids, setHazardousAsteroids] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    actions.setCurrentPage('asteroids')

    if (!state.asteroidsData.feed) {
      api.fetchAsteroidsToday()
    }

    loadHazardousAsteroids()
  }, [])

  const loadHazardousAsteroids = async () => {
    try {
      setLoading(true)
      const response = await apiService.neows.getHazardous()
      setHazardousAsteroids(response.data.hazardous_objects || [])
    } catch (error) {
      console.error('Failed to load hazardous asteroids:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        api.fetchAsteroidsToday(),
        loadHazardousAsteroids()
      ])
      actions.addNotification({
        type: 'success',
        title: 'Data Updated',
        message: 'Asteroid tracking data refreshed'
      })
    } catch (error) {
      actions.addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const getThreatLevel = () => {
    if (!state.asteroidsData.feed) return 'unknown'

    const totalObjects = state.asteroidsData.feed.element_count || 0
    const hazardousCount = hazardousAsteroids.length

    if (hazardousCount === 0) return 'low'
    if (hazardousCount < 3) return 'medium'
    return 'high'
  }

  const threatLevel = getThreatLevel()
  const threatColors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    unknown: 'secondary'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <MissionControlPanel
        title="ASTEROID THREAT MONITORING"
        subtitle="Near Earth Object Tracking System"
        status={threatLevel === 'high' ? 'warning' : 'operational'}
        headerActions={
          <div className="flex items-center space-x-4">
            <Badge variant={threatColors[threatLevel]} size="md">
              Threat Level: {threatLevel.toUpperCase()}
            </Badge>
            <Button
              onClick={refreshData}
              loading={loading}
              icon="🔄"
              size="sm"
            >
              Refresh Data
            </Button>
          </div>
        }
      >
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MissionControlPanel.MetricCard
            title="Total Objects Today"
            value={state.asteroidsData.feed?.element_count || 0}
            icon="☄️"
            status="operational"
          />
          <MissionControlPanel.MetricCard
            title="Potentially Hazardous"
            value={hazardousAsteroids.length}
            icon="⚠️"
            status={hazardousAsteroids.length > 0 ? 'warning' : 'operational'}
          />
          <MissionControlPanel.MetricCard
            title="Closest Approach"
            value={state.asteroidsData.feed?.risk_summary?.closest_approach?.distance
              ? `${Math.round(state.asteroidsData.feed.risk_summary.closest_approach.distance).toLocaleString()} km`
              : 'N/A'}
            icon="🎯"
            status="operational"
          />
          <MissionControlPanel.MetricCard
            title="Largest Object"
            value={state.asteroidsData.feed?.risk_summary?.largest_object?.diameter
              ? `${state.asteroidsData.feed.risk_summary.largest_object.diameter.toFixed(2)} km`
              : 'N/A'}
            icon="🌑"
            status="operational"
          />
        </div>
      </MissionControlPanel>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MissionControlPanel
          title="THREAT ANALYSIS"
          subtitle="Daily object tracking"
          status="operational"
        >
          <AsteroidThreatChart asteroidData={state.asteroidsData.feed} />
        </MissionControlPanel>

        <MissionControlPanel
          title="SIZE DISTRIBUTION"
          subtitle="Object classification by diameter"
          status="operational"
        >
          <AsteroidSizeDistribution asteroidData={state.asteroidsData.feed} />
        </MissionControlPanel>
      </div>

      <MissionControlPanel
        title="VELOCITY ANALYSIS"
        subtitle="Speed distribution of approaching objects"
        status="operational"
      >
        <AsteroidVelocityChart asteroidData={state.asteroidsData.feed} />
      </MissionControlPanel>

      {/* Hazardous Objects Table */}
      {hazardousAsteroids.length > 0 && (
        <MissionControlPanel
          title="POTENTIALLY HAZARDOUS ASTEROIDS"
          subtitle="Objects requiring close monitoring"
          status="warning"
        >
          <MissionControlPanel.DataGrid
            data={hazardousAsteroids.slice(0, 10)}
            columns={[
              {
                header: 'Name',
                key: 'name',
                render: (value) => <span className="font-mono text-sm">{value}</span>
              },
              {
                header: 'Diameter (km)',
                key: 'diameter_km',
                render: (value) => value?.toFixed(3) || 'Unknown'
              },
              {
                header: 'Next Approach',
                key: 'close_approach_data',
                render: (approaches) => {
                  const next = approaches?.[0]
                  return next ? new Date(next.date).toLocaleDateString() : 'Unknown'
                }
              },
              {
                header: 'Distance (km)',
                key: 'close_approach_data',
                render: (approaches) => {
                  const next = approaches?.[0]
                  return next ? Math.round(next.distance_km).toLocaleString() : 'Unknown'
                }
              },
              {
                header: 'Velocity (km/h)',
                key: 'close_approach_data',
                render: (approaches) => {
                  const next = approaches?.[0]
                  return next ? Math.round(next.velocity_kmh).toLocaleString() : 'Unknown'
                }
              }
            ]}
          />
        </MissionControlPanel>
      )}
    </div>
  )
}

export default AsteroidTracker