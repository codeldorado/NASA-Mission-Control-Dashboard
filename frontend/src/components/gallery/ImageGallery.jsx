import { useState, useCallback } from 'react'
import { clsx } from 'clsx'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import SmartImage from '../ui/SmartImage'

function ImageGallery({ 
  images = [], 
  title = null,
  columns = 3,
  showMetadata = true,
  className = '',
  ...props 
}) {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
  }

  if (!images.length) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌌</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Images Available</h3>
        <p className="text-gray-400">Check back later for new space imagery</p>
      </div>
    )
  }

  return (
    <div className={clsx('space-y-6', className)} {...props}>
      {title && (
        <h2 className="text-2xl font-bold text-white font-space text-center">{title}</h2>
      )}
      
      <div className={clsx('grid gap-4', gridClasses[columns] || gridClasses[3])}>
        {images.map((image, index) => {
          const imageId = image.id || image.img_src || index
          
          return (
            <div
              key={imageId}
              className="group relative bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <SmartImage.NASA
                  src={image.img_src || image.url}
                  alt={image.title || image.camera?.full_name || 'Space Image'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  useProxy={true}
                  retryCount={3}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                
                {/* Hover content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="primary" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
              
              {/* Metadata */}
              {showMetadata && (
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-white truncate">
                    {image.title || image.camera?.full_name || 'Space Image'}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    {image.earth_date && (
                      <span className="text-sm text-gray-400">
                        {new Date(image.earth_date).toLocaleDateString()}
                      </span>
                    )}
                    
                    {image.rover && (
                      <Badge variant="info" size="sm">
                        {image.rover.name}
                      </Badge>
                    )}
                    
                    {image.camera && (
                      <Badge variant="secondary" size="sm">
                        {image.camera.name}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          size="xl"
          title={selectedImage.title || selectedImage.camera?.full_name || 'Space Image'}
        >
          <div className="space-y-4">
            <div className="relative">
              <SmartImage.NASA
                src={selectedImage.img_src || selectedImage.url}
                alt={selectedImage.title || selectedImage.camera?.full_name || 'Space Image'}
                className="w-full h-auto rounded-lg"
                useProxy={true}
                retryCount={3}
              />
            </div>
            
            {/* Image details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {selectedImage.earth_date && (
                <div>
                  <span className="text-gray-400">Date:</span>
                  <span className="ml-2 text-white">
                    {new Date(selectedImage.earth_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              {selectedImage.sol && (
                <div>
                  <span className="text-gray-400">Sol:</span>
                  <span className="ml-2 text-white">{selectedImage.sol}</span>
                </div>
              )}
              
              {selectedImage.rover && (
                <div>
                  <span className="text-gray-400">Rover:</span>
                  <span className="ml-2 text-white">{selectedImage.rover.name}</span>
                </div>
              )}
              
              {selectedImage.camera && (
                <div>
                  <span className="text-gray-400">Camera:</span>
                  <span className="ml-2 text-white">{selectedImage.camera.full_name}</span>
                </div>
              )}
              
              {selectedImage.explanation && (
                <div className="md:col-span-2">
                  <span className="text-gray-400">Description:</span>
                  <p className="mt-2 text-white leading-relaxed">{selectedImage.explanation}</p>
                </div>
              )}
              
              {selectedImage.copyright && (
                <div className="md:col-span-2">
                  <span className="text-gray-400">Copyright:</span>
                  <span className="ml-2 text-white">{selectedImage.copyright}</span>
                </div>
              )}
            </div>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => window.open(selectedImage.img_src || selectedImage.url, '_blank')}
              >
                View Full Size
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ImageGallery