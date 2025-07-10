import React, { useMemo, useEffect, useState } from 'react'
import { Line, Radar } from 'react-chartjs-2'
import BaseChart, { defaultChartOptions, spaceColors, createSpaceDataset } from './BaseChart'

function SystemPerformanceChart({ apiHealth, className = '' }) {
  const [performanceHistory, setPerformanceHistory] = useState([])

  // Simulate real-time performance data
  useEffect(() => {
    if (!apiHealth) return

    const newDataPoint = {
      timestamp: new Date().toLocaleTimeString(),
      uptime: Math.floor(apiHealth.uptime / 60),
      cacheKeys: apiHealth.cache?.keys || 0,
      hitRate: (apiHealth.cache?.hitRate || 0) * 100,
      responseTime: Math.random() * 100 + 50 // Simulated response time
    }

    setPerformanceHistory(prev => {
      const updated = [...prev, newDataPoint]
      return updated.slice(-20) // Keep last 20 data points
    })
  }, [apiHealth])

  const chartData = useMemo(() => {
    if (performanceHistory.length === 0) return null

    return {
      labels: performanceHistory.map(point => point.timestamp),
      datasets: [
        {
          ...createSpaceDataset('Cache Hit Rate (%)', performanceHistory.map(p => p.hitRate), 0),
          yAxisID: 'y'
        },
        {
          ...createSpaceDataset('Response Time (ms)', performanceHistory.map(p => p.responseTime), 1),
          yAxisID: 'y1'
        }
      ]
    }
  }, [performanceHistory])

  if (!chartData) {
    return (
      <BaseChart title="System Performance" subtitle="Real-time metrics">
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="animate-pulse text-4xl mb-2">📊</div>
            <p>Collecting performance data...</p>
          </div>
        </div>
      </BaseChart>
    )
  }

  const options = {
    ...defaultChartOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'System Performance Metrics',
        color: '#f3f4f6',
        font: {
          family: 'Orbitron, monospace',
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ...defaultChartOptions.scales.x,
        title: {
          display: true,
          text: 'Time',
          color: '#9ca3af'
        }
      },
      y: {
        ...defaultChartOptions.scales.y,
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Cache Hit Rate (%)',
          color: spaceColors.primary
        },
        min: 0,
        max: 100
      },
      y1: {
        ...defaultChartOptions.scales.y,
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Response Time (ms)',
          color: spaceColors.secondary
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }

  return (
    <BaseChart title="System Performance" subtitle="Real-time metrics" className={className}>
      <Line data={chartData} options={options} />
    </BaseChart>
  )
}

function SystemHealthRadar({ apiHealth, className = '' }) {
  const chartData = useMemo(() => {
    if (!apiHealth) return null

    const healthMetrics = {
      'API Response': apiHealth.services?.api === 'operational' ? 100 : 0,
      'NASA Gateway': apiHealth.services?.nasa_api === 'operational' ? 100 : 0,
      'Cache System': apiHealth.services?.cache === 'operational' ? 100 : 0,
      'Uptime': Math.min((apiHealth.uptime / 3600) * 10, 100), // Scale uptime to 0-100
      'Performance': (apiHealth.cache?.hitRate || 0) * 100,
      'Stability': Math.random() * 20 + 80 // Simulated stability metric
    }

    return {
      labels: Object.keys(healthMetrics),
      datasets: [{
        label: 'System Health',
        data: Object.values(healthMetrics),
        backgroundColor: spaceColors.primary + '20',
        borderColor: spaceColors.primary,
        pointBackgroundColor: spaceColors.primary,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: spaceColors.primary,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    }
  }, [apiHealth])

  if (!chartData) return null

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'System Health Overview',
        color: '#f3f4f6',
        font: {
          family: 'Orbitron, monospace',
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Rajdhani, sans-serif',
            size: 10
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        pointLabels: {
          color: '#e5e7eb',
          font: {
            family: 'Rajdhani, sans-serif',
            size: 12
          }
        }
      }
    }
  }

  return (
    <BaseChart title="System Health" subtitle="Multi-dimensional overview" className={className}>
      <Radar data={chartData} options={options} />
    </BaseChart>
  )
}

function APIUsageChart({ className = '' }) {
  const [usageData, setUsageData] = useState([])

  // Simulate API usage data
  useEffect(() => {
    const generateUsageData = () => {
      const endpoints = ['APOD', 'Mars Rovers', 'NeoWs', 'EPIC', 'Health']
      const data = endpoints.map(endpoint => ({
        endpoint,
        requests: Math.floor(Math.random() * 100) + 10,
        errors: Math.floor(Math.random() * 5),
        avgResponseTime: Math.floor(Math.random() * 200) + 50
      }))
      setUsageData(data)
    }

    generateUsageData()
    const interval = setInterval(generateUsageData, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const chartData = useMemo(() => {
    if (usageData.length === 0) return null

    return {
      labels: usageData.map(item => item.endpoint),
      datasets: [
        {
          label: 'Successful Requests',
          data: usageData.map(item => item.requests - item.errors),
          backgroundColor: spaceColors.success + '80',
          borderColor: spaceColors.success,
          borderWidth: 2
        },
        {
          label: 'Failed Requests',
          data: usageData.map(item => item.errors),
          backgroundColor: spaceColors.error + '80',
          borderColor: spaceColors.error,
          borderWidth: 2
        }
      ]
    }
  }, [usageData])

  if (!chartData) return null

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'API Endpoint Usage',
        color: '#f3f4f6',
        font: {
          family: 'Orbitron, monospace',
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      ...defaultChartOptions.scales,
      x: {
        ...defaultChartOptions.scales.x,
        stacked: true
      },
      y: {
        ...defaultChartOptions.scales.y,
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Requests',
          color: '#9ca3af'
        }
      }
    }
  }

  return (
    <BaseChart title="API Usage" subtitle="Endpoint request statistics" className={className}>
      <Line data={chartData} options={options} />
    </BaseChart>
  )
}

export { SystemPerformanceChart, SystemHealthRadar, APIUsageChart }