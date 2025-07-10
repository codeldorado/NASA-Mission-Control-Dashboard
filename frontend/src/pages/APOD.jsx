import React, { useEffect, useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import LoadingSpinner from '../components/LoadingSpinner'
import MissionControlPanel from '../components/ui/MissionControlPanel'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ImageGallery from '../components/gallery/ImageGallery'
import SmartImage from '../components/ui/SmartImage'
import { apiService } from '../services/api'

function APOD() {
  const { state, actions, api } = useAppContext()
  const [selectedDate, setSelectedDate] = useState('')
  const [randomImages, setRandomImages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    actions.setCurrentPage('apod')

    if (!state.apodData) {
      api.fetchApodToday()
    }

    // Load some random images for the gallery
    loadRandomImages()
  }, [])

  const loadRandomImages = async () => {
    try {
      setLoading(true)
      const response = await apiService.apod.getRandom(6)
      setRandomImages(Array.isArray(response.data) ? response.data : [response.data])
    } catch (error) {
      console.error('Failed to load random APOD images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSearch = async () => {
    if (!selectedDate) return

    try {
      setLoading(true)
      const response = await apiService.apod.getByDate(selectedDate)
      actions.setApodData(response.data)
    } catch (error) {
      actions.addNotification({
        type: 'error',
        title: 'Failed to load APOD',
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <MissionControlPanel
        title="ASTRONOMY PICTURE OF THE DAY"
        subtitle="Discover the cosmos through NASA's featured space imagery"
        status="operational"
        headerActions={
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
              max={new Date().toISOString().split('T')[0]}
            />
            <Button
              onClick={handleDateSearch}
              loading={loading}
              disabled={!selectedDate}
              size="sm"
            >
              Search
            </Button>
          </div>
        }
      >
        {/* Today's Featured Image */}
        {state.apodData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative">
              <SmartImage.APOD
                apodData={state.apodData}
                className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(state.apodData.hdurl || state.apodData.url, '_blank')}
                >
                  HD Version
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{state.apodData.title}</h2>
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(state.apodData.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <p className="text-gray-300 leading-relaxed">{state.apodData.explanation}</p>

              {state.apodData.copyright && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Copyright:</span> {state.apodData.copyright}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </MissionControlPanel>

      {/* Random APOD Gallery */}
      <MissionControlPanel
        title="EXPLORE MORE"
        subtitle="Random selections from NASA's APOD archive"
        status="operational"
        headerActions={
          <Button
            onClick={loadRandomImages}
            loading={loading}
            icon="🔄"
            size="sm"
          >
            Load More
          </Button>
        }
      >
        {randomImages.length > 0 ? (
          <ImageGallery
            images={randomImages}
            columns={3}
            showMetadata={true}
          />
        ) : (
          <div className="text-center py-8">
            {loading ? (
              <LoadingSpinner message="Loading random APOD images..." />
            ) : (
              <div className="text-gray-400">
                <div className="text-4xl mb-2">🌌</div>
                <p>Click "Load More" to explore random APOD images</p>
              </div>
            )}
          </div>
        )}
      </MissionControlPanel>
    </div>
  )
}

export default APOD