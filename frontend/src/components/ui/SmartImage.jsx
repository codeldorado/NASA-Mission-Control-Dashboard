import React, { useState, useCallback, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

function SmartImage({
  src,
  alt = '',
  className = '',
  fallbackSrc = null,
  placeholder = null,
  useProxy = true,
  retryCount = 2,
  timeout = 10000,
  onLoad = null,
  onError = null,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false) // Prevent infinite loops
  const imgRef = useRef(null)
  const timeoutRef = useRef(null)

  // Generate proxy URL if needed
  const getProxiedUrl = useCallback((url) => {
    if (!url || !useProxy) return url
    
    // Check if it's already a proxy URL
    if (url.includes('/api/proxy/image')) return url
    
    // Check if it's a NASA URL that needs proxying
    const nasaDomains = ['apod.nasa.gov', 'mars.nasa.gov', 'api.nasa.gov', 'epic.gsfc.nasa.gov']
    const needsProxy = nasaDomains.some(domain => url.includes(domain))
    
    if (needsProxy) {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`
    }
    
    return url
  }, [useProxy])

  // Initialize image source
  useEffect(() => {
    if (src) {
      setCurrentSrc(getProxiedUrl(src))
      setIsLoading(true)
      setHasError(false)
      setRetryAttempts(0)
      setFallbackAttempted(false)
      setIsFinalized(false)
    }
  }, [src, getProxiedUrl])

  // Handle image load success
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    onLoad?.()
  }, [onLoad])

  // Handle image load error
  const handleError = useCallback(() => {
    // Prevent infinite loops - if already finalized, don't retry
    if (isFinalized) {
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Try retries first (only for original source, not fallback)
    if (!fallbackAttempted && retryAttempts < retryCount && src) {
      console.warn(`Image load failed, retrying (${retryAttempts + 1}/${retryCount}):`, currentSrc)
      setRetryAttempts(prev => prev + 1)

      // Try without proxy first, then with proxy
      if (retryAttempts === 0 && useProxy) {
        setCurrentSrc(src) // Try original URL
      } else {
        setCurrentSrc(getProxiedUrl(src)) // Try proxy URL
      }

      setIsLoading(true)
      return
    }

    // Try fallback image (only once)
    if (fallbackSrc && !fallbackAttempted && currentSrc !== fallbackSrc) {
      console.warn('Using fallback image:', fallbackSrc)
      setCurrentSrc(fallbackSrc)
      setFallbackAttempted(true)
      setIsLoading(true)
      // Don't reset retry attempts for fallback
      return
    }

    // All attempts failed - finalize error state
    console.error('Image load failed after all retries:', src)
    setIsLoading(false)
    setHasError(true)
    setIsFinalized(true) // Prevent further attempts
    onError?.()
  }, [src, currentSrc, fallbackSrc, retryAttempts, retryCount, useProxy, getProxiedUrl, onError, fallbackAttempted, isFinalized])

  // Set up timeout for slow loading images
  useEffect(() => {
    if (isLoading && currentSrc && !isFinalized) {
      timeoutRef.current = setTimeout(() => {
        console.warn('Image load timeout:', currentSrc)
        handleError()
      }, timeout)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isLoading, currentSrc, timeout, handleError, isFinalized])

  // Render loading placeholder
  if (isLoading && !hasError) {
    return (
      <div 
        className={clsx(
          'flex items-center justify-center bg-gray-800 animate-pulse',
          className
        )}
        {...props}
      >
        {placeholder || (
          <div className="text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-space-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm">Loading...</p>
          </div>
        )}
      </div>
    )
  }

  // Render error state
  if (hasError) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gray-800 text-gray-400 border-2 border-dashed border-gray-600',
          className
        )}
        {...props}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🚫</div>
          <p className="text-sm font-medium">Failed to Load</p>
          <p className="text-xs mt-1 opacity-75">Image unavailable</p>
        </div>
      </div>
    )
  }

  // Render image
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={clsx('transition-opacity duration-300', className)}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}

// Higher-order component for NASA images specifically
function NASAImage({ src, ...props }) {
  return (
    <SmartImage
      src={src}
      useProxy={true}
      retryCount={3}
      timeout={15000}
      fallbackSrc="/space-placeholder.jpg" // We'll create this
      {...props}
    />
  )
}

// Component for APOD images with specific handling
function APODImage({ apodData, ...props }) {
  if (!apodData) return null

  // Handle video content
  if (apodData.media_type === 'video') {
    return (
      <div className={clsx('relative bg-gray-900 rounded-lg overflow-hidden', props.className)}>
        <iframe
          src={apodData.url}
          title={apodData.title}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
        />
        <div className="absolute top-4 right-4">
          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            VIDEO
          </span>
        </div>
      </div>
    )
  }

  return (
    <NASAImage
      src={apodData.url}
      alt={apodData.title}
      {...props}
    />
  )
}

// Component for Mars rover images
function MarsRoverImage({ photo, ...props }) {
  if (!photo) return null

  return (
    <NASAImage
      src={photo.img_src}
      alt={`Mars photo by ${photo.rover?.name} rover using ${photo.camera?.full_name}`}
      {...props}
    />
  )
}

// Component for EPIC Earth images
function EPICImage({ image, ...props }) {
  if (!image) return null

  return (
    <NASAImage
      src={image.image_url}
      alt={`Earth from space - ${image.date}`}
      {...props}
    />
  )
}

SmartImage.NASA = NASAImage
SmartImage.APOD = APODImage
SmartImage.MarsRover = MarsRoverImage
SmartImage.EPIC = EPICImage

export default SmartImage