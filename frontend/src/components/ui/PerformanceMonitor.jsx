import React, { useState, useEffect } from 'react'
import { usePerformance } from '../../hooks/usePerformance'
import Card from './Card'
import Badge from './Badge'
import Button from './Button'

function PerformanceMonitor({ isVisible = false, onClose }) {
  const { metrics, getMemoryUsage } = usePerformance()
  const [detailedMetrics, setDetailedMetrics] = useState(null)

  useEffect(() => {
    if (isVisible) {
      const updateDetailedMetrics = () => {
        const memory = getMemoryUsage()
        const navigation = performance.getEntriesByType('navigation')[0]
        const resources = performance.getEntriesByType('resource')
        
        setDetailedMetrics({
          memory,
          navigation: navigation ? {
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
            loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
            totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
          } : null,
          resources: {
            total: resources.length,
            images: resources.filter(r => r.initiatorType === 'img').length,
            scripts: resources.filter(r => r.initiatorType === 'script').length,
            stylesheets: resources.filter(r => r.initiatorType === 'link').length
          },
          fps: getFPS()
        })
      }

      updateDetailedMetrics()
      const interval = setInterval(updateDetailedMetrics, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isVisible, getMemoryUsage])

  // Simple FPS counter
  const getFPS = () => {
    let fps = 0
    let lastTime = performance.now()
    let frameCount = 0

    const countFrames = (currentTime) => {
      frameCount++
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime
      }
      if (frameCount < 60) {
        requestAnimationFrame(countFrames)
      }
    }

    requestAnimationFrame(countFrames)
    return fps
  }

  const getPerformanceGrade = () => {
    const { loadTime, renderTime, memoryUsage } = metrics
    let score = 100

    // Deduct points for slow loading
    if (loadTime > 3000) score -= 20
    else if (loadTime > 2000) score -= 10

    // Deduct points for slow rendering
    if (renderTime > 100) score -= 15
    else if (renderTime > 50) score -= 5

    // Deduct points for high memory usage
    if (memoryUsage > 100) score -= 15
    else if (memoryUsage > 50) score -= 5

    if (score >= 90) return { grade: 'A', color: 'success' }
    if (score >= 80) return { grade: 'B', color: 'info' }
    if (score >= 70) return { grade: 'C', color: 'warning' }
    return { grade: 'D', color: 'error' }
  }

  const clearPerformanceData = () => {
    if (performance.clearMarks) performance.clearMarks()
    if (performance.clearMeasures) performance.clearMeasures()
    if (performance.clearResourceTimings) performance.clearResourceTimings()
  }

  if (!isVisible) return null

  const performanceGrade = getPerformanceGrade()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="glow" className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>🚀 Performance Monitor</Card.Title>
              <Card.Description>Real-time application performance metrics</Card.Description>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={performanceGrade.color} size="lg">
                Grade: {performanceGrade.grade}
              </Badge>
              <Button variant="secondary" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Metrics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Load Time:</span>
                  <span className="font-mono">{(metrics.loadTime / 1000).toFixed(2)}s</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Render Time:</span>
                  <span className="font-mono">{metrics.renderTime.toFixed(2)}ms</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory Usage:</span>
                  <span className="font-mono">{metrics.memoryUsage}MB</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">API Calls:</span>
                  <span className="font-mono">{metrics.apiCalls}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Cache Hits:</span>
                  <span className="font-mono">{metrics.cacheHits}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Cache Hit Rate:</span>
                  <span className="font-mono">
                    {metrics.apiCalls > 0 ? ((metrics.cacheHits / metrics.apiCalls) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Details */}
            {detailedMetrics?.memory && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Memory Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used Heap:</span>
                    <span className="font-mono">{detailedMetrics.memory.used}MB</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Heap:</span>
                    <span className="font-mono">{detailedMetrics.memory.total}MB</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heap Limit:</span>
                    <span className="font-mono">{detailedMetrics.memory.limit}MB</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-space-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(detailedMetrics.memory.used / detailedMetrics.memory.limit) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Timing */}
            {detailedMetrics?.navigation && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Navigation Timing</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">DOM Content Loaded:</span>
                    <span className="font-mono">{detailedMetrics.navigation.domContentLoaded}ms</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Load Complete:</span>
                    <span className="font-mono">{detailedMetrics.navigation.loadComplete}ms</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Time:</span>
                    <span className="font-mono">{detailedMetrics.navigation.totalTime}ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Resource Loading */}
            {detailedMetrics?.resources && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Resources</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Resources:</span>
                    <span className="font-mono">{detailedMetrics.resources.total}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Images:</span>
                    <span className="font-mono">{detailedMetrics.resources.images}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scripts:</span>
                    <span className="font-mono">{detailedMetrics.resources.scripts}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stylesheets:</span>
                    <span className="font-mono">{detailedMetrics.resources.stylesheets}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tips */}
            <div className="space-y-4 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-white">Performance Tips</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">✅ Good Performance</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Load time under 2 seconds</li>
                    <li>• Memory usage under 50MB</li>
                    <li>• High cache hit rate</li>
                    <li>• Smooth animations (60fps)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-yellow-400 mb-2">⚠️ Optimization Opportunities</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Enable image compression</li>
                    <li>• Use lazy loading for images</li>
                    <li>• Implement service workers</li>
                    <li>• Optimize bundle size</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={clearPerformanceData}>
                Clear Data
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}

export default PerformanceMonitor