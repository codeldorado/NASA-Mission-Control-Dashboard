import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import SmartImage from '../ui/SmartImage'

function EarthImageViewer({ 
  images = [], 
  className = '',
  autoPlay = false,
  interval = 5000,
  ...props 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [imageLoading, setImageLoading] = useState(true)

  const currentImage = images[currentIndex]

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, images.length, interval])

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
    setImageLoading(true)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length)
    setImageLoading(true)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  if (!images.length) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">🌍</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Earth Images Available</h3>
        <p className="text-gray-400">EPIC imagery will appear here when available</p>
      </Card>
    )
  }

  return (
    <div className={clsx('space-y-4', className)} {...props}>
      {/* Main Image Display */}
      <Card variant="glow" className="relative overflow-hidden">
        <div className="relative aspect-square bg-gray-900">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-space-500 border-t-transparent rounded-full" />
            </div>
          )}
          
          {currentImage && (
            <SmartImage.EPIC
              image={currentImage}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading ? 'none' : 'block' }}
              useProxy={true}
              retryCount={3}
            />
          )}
          
          {/* Navigation Overlay */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Next image"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Earth from Space
                </h3>
                <p className="text-gray-300 text-sm">
                  {currentImage && new Date(currentImage.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="info" size="sm">
                  EPIC
                </Badge>
                <Badge variant="secondary" size="sm">
                  {currentIndex + 1} / {images.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {images.length > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePlayback}
              icon={isPlaying ? '⏸️' : '▶️'}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(currentImage?.image_url, '_blank')}
          >
            Full Resolution
          </Button>
        </div>
        
        {/* Image metadata */}
        {currentImage && (
          <div className="text-sm text-gray-400">
            <span>Coordinates: </span>
            <span className="font-mono">
              {currentImage.coords?.centroid_coordinates?.lat?.toFixed(2)}°, {' '}
              {currentImage.coords?.centroid_coordinates?.lon?.toFixed(2)}°
            </span>
          </div>
        )}
      </div>
      
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setImageLoading(true)
              }}
              className={clsx(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-space-500 ring-2 ring-space-500/50'
                  : 'border-gray-600 hover:border-gray-500'
              )}
            >
              <SmartImage.NASA
                src={image.thumbnail_url || image.image_url}
                alt={`Earth thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                useProxy={true}
                retryCount={2}
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Technical Details */}
      {currentImage && (
        <Card variant="flat" className="text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-400">Image ID:</span>
              <p className="font-mono text-white">{currentImage.image}</p>
            </div>
            
            {currentImage.sun_j2000_position && (
              <div>
                <span className="text-gray-400">Sun Position:</span>
                <p className="font-mono text-white text-xs">
                  [{currentImage.sun_j2000_position.x?.toFixed(0)}, {' '}
                  {currentImage.sun_j2000_position.y?.toFixed(0)}, {' '}
                  {currentImage.sun_j2000_position.z?.toFixed(0)}]
                </p>
              </div>
            )}
            
            {currentImage.lunar_j2000_position && (
              <div>
                <span className="text-gray-400">Moon Position:</span>
                <p className="font-mono text-white text-xs">
                  [{currentImage.lunar_j2000_position.x?.toFixed(0)}, {' '}
                  {currentImage.lunar_j2000_position.y?.toFixed(0)}, {' '}
                  {currentImage.lunar_j2000_position.z?.toFixed(0)}]
                </p>
              </div>
            )}
            
            <div>
              <span className="text-gray-400">Version:</span>
              <p className="text-white">{currentImage.version || 'Latest'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EarthImageViewer