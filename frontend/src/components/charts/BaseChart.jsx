import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
)

// Space-themed color palette
export const spaceColors = {
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  cosmic: '#d946ef',
  nebula: '#f43f5e',
  gradients: {
    space: ['#667eea', '#764ba2'],
    cosmic: ['#ff6b6b', '#ee5a24', '#ff9ff3', '#54a0ff', '#5f27cd'],
    nebula: ['#ff9a9e', '#fecfef', '#fecfef'],
    aurora: ['#a8edea', '#fed6e3']
  }
}

// Default chart options with space theme
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#e5e7eb',
        font: {
          family: 'Rajdhani, sans-serif',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#f3f4f6',
      bodyColor: '#e5e7eb',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      titleFont: {
        family: 'Rajdhani, sans-serif',
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        family: 'Rajdhani, sans-serif',
        size: 12
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#9ca3af',
        font: {
          family: 'Rajdhani, sans-serif',
          size: 11
        }
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)',
        borderColor: '#374151'
      }
    },
    y: {
      ticks: {
        color: '#9ca3af',
        font: {
          family: 'Rajdhani, sans-serif',
          size: 11
        }
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)',
        borderColor: '#374151'
      }
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2
    },
    line: {
      borderWidth: 2,
      tension: 0.4
    },
    bar: {
      borderRadius: 4,
      borderSkipped: false
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}

// Utility function to create gradient
export const createGradient = (ctx, colors, direction = 'vertical') => {
  const gradient = direction === 'vertical' 
    ? ctx.createLinearGradient(0, 0, 0, 400)
    : ctx.createLinearGradient(0, 0, 400, 0)
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })
  
  return gradient
}

// Utility function to generate space-themed dataset
export const createSpaceDataset = (label, data, colorIndex = 0) => {
  const colors = [
    spaceColors.primary,
    spaceColors.secondary,
    spaceColors.cosmic,
    spaceColors.accent,
    spaceColors.success,
    spaceColors.warning,
    spaceColors.error
  ]
  
  const color = colors[colorIndex % colors.length]
  
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color + '20', // 20% opacity
    pointBackgroundColor: color,
    pointBorderColor: '#ffffff',
    pointHoverBackgroundColor: '#ffffff',
    pointHoverBorderColor: color,
    fill: false
  }
}

// Base chart wrapper component
function BaseChart({ children, title, subtitle, className = '', ...props }) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h3 className="text-lg font-bold text-white font-space">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="relative h-64 md:h-80">
        {children}
      </div>
    </div>
  )
}

export default BaseChart