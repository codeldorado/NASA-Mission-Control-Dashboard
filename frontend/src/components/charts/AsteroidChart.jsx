import React, { useMemo } from 'react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import BaseChart, { defaultChartOptions, spaceColors, createSpaceDataset } from './BaseChart'

function AsteroidThreatChart({ asteroidData }) {
  const chartData = useMemo(() => {
    if (!asteroidData?.near_earth_objects) return null

    const dates = Object.keys(asteroidData.near_earth_objects).sort()
    const dailyCounts = dates.map(date => asteroidData.near_earth_objects[date].length)
    const hazardousCounts = dates.map(date => 
      asteroidData.near_earth_objects[date].filter(obj => obj.is_potentially_hazardous_asteroid).length
    )

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          ...createSpaceDataset('Total Objects', dailyCounts, 0),
          fill: true,
          backgroundColor: spaceColors.primary + '20'
        },
        {
          ...createSpaceDataset('Potentially Hazardous', hazardousCounts, 5),
          fill: true,
          backgroundColor: spaceColors.error + '20'
        }
      ]
    }
  }, [asteroidData])

  if (!chartData) return null

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Near Earth Objects - Daily Tracking',
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
      y: {
        ...defaultChartOptions.scales.y,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Objects',
          color: '#9ca3af'
        }
      }
    }
  }

  return (
    <BaseChart>
      <Line data={chartData} options={options} />
    </BaseChart>
  )
}

function AsteroidSizeDistribution({ asteroidData }) {
  const chartData = useMemo(() => {
    if (!asteroidData?.near_earth_objects) return null

    const allObjects = Object.values(asteroidData.near_earth_objects).flat()
    const sizeCategories = {
      'Tiny (< 10m)': 0,
      'Small (10-100m)': 0,
      'Medium (100m-1km)': 0,
      'Large (1-10km)': 0,
      'Massive (> 10km)': 0
    }

    allObjects.forEach(obj => {
      const diameter = obj.estimated_diameter.meters.estimated_diameter_max
      if (diameter < 10) sizeCategories['Tiny (< 10m)']++
      else if (diameter < 100) sizeCategories['Small (10-100m)']++
      else if (diameter < 1000) sizeCategories['Medium (100m-1km)']++
      else if (diameter < 10000) sizeCategories['Large (1-10km)']++
      else sizeCategories['Massive (> 10km)']++
    })

    return {
      labels: Object.keys(sizeCategories),
      datasets: [{
        data: Object.values(sizeCategories),
        backgroundColor: [
          spaceColors.primary + '80',
          spaceColors.secondary + '80',
          spaceColors.accent + '80',
          spaceColors.warning + '80',
          spaceColors.error + '80'
        ],
        borderColor: [
          spaceColors.primary,
          spaceColors.secondary,
          spaceColors.accent,
          spaceColors.warning,
          spaceColors.error
        ],
        borderWidth: 2
      }]
    }
  }, [asteroidData])

  if (!chartData) return null

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Asteroid Size Distribution',
        color: '#f3f4f6',
        font: {
          family: 'Orbitron, monospace',
          size: 16,
          weight: 'bold'
        }
      }
    }
  }

  return (
    <BaseChart>
      <Doughnut data={chartData} options={options} />
    </BaseChart>
  )
}

function AsteroidVelocityChart({ asteroidData }) {
  const chartData = useMemo(() => {
    if (!asteroidData?.near_earth_objects) return null

    const allObjects = Object.values(asteroidData.near_earth_objects).flat()
    const velocityRanges = {
      'Slow (< 10 km/s)': 0,
      'Medium (10-20 km/s)': 0,
      'Fast (20-30 km/s)': 0,
      'Very Fast (> 30 km/s)': 0
    }

    allObjects.forEach(obj => {
      if (obj.close_approach_data.length > 0) {
        const velocity = parseFloat(obj.close_approach_data[0].relative_velocity.kilometers_per_second)
        if (velocity < 10) velocityRanges['Slow (< 10 km/s)']++
        else if (velocity < 20) velocityRanges['Medium (10-20 km/s)']++
        else if (velocity < 30) velocityRanges['Fast (20-30 km/s)']++
        else velocityRanges['Very Fast (> 30 km/s)']++
      }
    })

    return {
      labels: Object.keys(velocityRanges),
      datasets: [{
        label: 'Number of Objects',
        data: Object.values(velocityRanges),
        backgroundColor: spaceColors.gradients.cosmic.map(color => color + '60'),
        borderColor: spaceColors.gradients.cosmic,
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  }, [asteroidData])

  if (!chartData) return null

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Asteroid Velocity Distribution',
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
      y: {
        ...defaultChartOptions.scales.y,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Objects',
          color: '#9ca3af'
        }
      }
    }
  }

  return (
    <BaseChart>
      <Bar data={chartData} options={options} />
    </BaseChart>
  )
}

export { AsteroidThreatChart, AsteroidSizeDistribution, AsteroidVelocityChart }