import { useEffect, useRef, useState, useCallback } from 'react'

// Performance monitoring hook
export function usePerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    apiCalls: 0,
    cacheHits: 0
  })

  const startTime = useRef(Date.now())
  const apiCallCount = useRef(0)
  const cacheHitCount = useRef(0)

  // Measure component render time
  const measureRender = useCallback((componentName) => {
    const renderStart = performance.now()
    
    return () => {
      const renderEnd = performance.now()
      const renderTime = renderEnd - renderStart
      
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.max(prev.renderTime, renderTime)
      }))
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 ${componentName} render time: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [])

  // Track API calls
  const trackApiCall = useCallback((isCacheHit = false) => {
    apiCallCount.current++
    if (isCacheHit) cacheHitCount.current++
    
    setMetrics(prev => ({
      ...prev,
      apiCalls: apiCallCount.current,
      cacheHits: cacheHitCount.current
    }))
  }, [])

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      }
    }
    return null
  }, [])

  // Monitor performance metrics
  useEffect(() => {
    const updateMetrics = () => {
      const loadTime = Date.now() - startTime.current
      const memory = getMemoryUsage()
      
      setMetrics(prev => ({
        ...prev,
        loadTime,
        memoryUsage: memory?.used || 0
      }))
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    
    // Initial update
    updateMetrics()

    return () => clearInterval(interval)
  }, [getMemoryUsage])

  // Performance observer for navigation timing
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('📊 Navigation timing:', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              totalTime: entry.loadEventEnd - entry.fetchStart
            })
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['navigation'] })
      } catch (error) {
        console.warn('Performance observer not supported:', error)
      }

      return () => observer.disconnect()
    }
  }, [])

  return {
    metrics,
    measureRender,
    trackApiCall,
    getMemoryUsage
  }
}

// Hook for lazy loading images
export function useLazyLoading(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

// Hook for debouncing values
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle(callback, delay) {
  const lastCall = useRef(0)
  const timeoutRef = useRef(null)

  return useCallback((...args) => {
    const now = Date.now()
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      callback(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now()
        callback(...args)
      }, delay - (now - lastCall.current))
    }
  }, [callback, delay])
}

// Hook for viewport size
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  })

  useEffect(() => {
    const handleResize = useThrottle(() => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      })
    }, 100)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// Hook for preloading images
export function useImagePreloader(imageUrls) {
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const preloadImages = useCallback(async (urls) => {
    setIsLoading(true)
    
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]))
          resolve(url)
        }
        img.onerror = reject
        img.src = url
      })
    })

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (imageUrls.length > 0) {
      preloadImages(imageUrls)
    }
  }, [imageUrls, preloadImages])

  return { loadedImages, isLoading, preloadImages }
}