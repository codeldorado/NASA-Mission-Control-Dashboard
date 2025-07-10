import React, { useEffect, useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import MissionControlPanel from '../components/ui/MissionControlPanel'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import EarthImageViewer from '../components/gallery/EarthImageViewer'
import { apiService } from '../services/api'

function EarthObservation() {
  const { state, actions, api } = useAppContext()
  const [selectedDate, setSelectedDate] = useState('')
  const [imageType, setImageType] = useState('natural')
  const [loading, setLoading] = useState(false)
  const [availableDates, setAvailableDates] = useState([])

  useEffect(() => {
    actions.setCurrentPage('earth')

    if (state.earthData.images.length === 0) {
      api.fetchEarthImages()
    }

    loadAvailableDates()
  }, [])

  const loadAvailableDates = async () => {
    try {
      const response = await apiService.epic.getAvailableDates(imageType)
      setAvailableDates(response.data.slice(0, 30)) // Last 30 available dates
    } catch (error) {
      console.error('Failed to load available dates:', error)
    }
  }

  const loadImagesForDate = async () => {
    if (!selectedDate) return

    try {
      setLoading(true)
      const response = await apiService.epic.getImages(selectedDate, imageType)
      actions.setEarthData({ images: response.data })
    } catch (error) {
      actions.addNotification({
        type: 'error',
        title: 'Failed to load Earth images',
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = async (newType) => {
    setImageType(newType)
    setLoading(true)

    try {
      const response = await apiService.epic.getLatest(newType)
      actions.setEarthData({ images: response.data, currentType: newType })

      // Also update available dates for new type
      const datesResponse = await apiService.epic.getAvailableDates(newType)
      setAvailableDates(datesResponse.data.slice(0, 30))
    } catch (error) {
      actions.addNotification({
        type: 'error',
        title: 'Failed to switch image type',
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
        title="EARTH OBSERVATION SYSTEM"
        subtitle="EPIC - Earth Polychromatic Imaging Camera"
        status="operational"
        headerActions={
          <div className="flex items-center space-x-2">
            <Input.Select
              value={imageType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-32"
            >
              <option value="natural">Natural</option>
              <option value="enhanced">Enhanced</option>
            </Input.Select>

            <Input.Select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            >
              <option value="">Latest Images</option>
              {availableDates.map((dateObj) => (
                <option key={dateObj.date} value={dateObj.date}>
                  {new Date(dateObj.date).toLocaleDateString()}
                </option>
              ))}
            </Input.Select>

            <Button
              onClick={loadImagesForDate}
              loading={loading}
              disabled={!selectedDate}
              size="sm"
            >
              Load Date
            </Button>
          </div>
        }
      >
        {/* Earth Image Viewer */}
        <EarthImageViewer
          images={state.earthData.images}
          autoPlay={true}
          interval={8000}
        />
      </MissionControlPanel>

      {/* Earth Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MissionControlPanel
          title="IMAGE STATISTICS"
          subtitle="Current dataset metrics"
          status="operational"
        >
          <div className="space-y-4">
            <MissionControlPanel.MetricCard
              title="Available Images"
              value={state.earthData.images.length}
              icon="📸"
              status="operational"
            />
            <MissionControlPanel.MetricCard
              title="Image Type"
              value={imageType.charAt(0).toUpperCase() + imageType.slice(1)}
              icon="🎨"
              status="operational"
            />
            <MissionControlPanel.MetricCard
              title="Latest Date"
              value={state.earthData.images[0]?.date
                ? new Date(state.earthData.images[0].date).toLocaleDateString()
                : 'N/A'}
              icon="📅"
              status="operational"
            />
          </div>
        </MissionControlPanel>

        <MissionControlPanel
          title="CAMERA INFORMATION"
          subtitle="EPIC instrument details"
          status="operational"
        >
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Instrument:</span>
              <p className="text-white">Earth Polychromatic Imaging Camera</p>
            </div>
            <div>
              <span className="text-gray-400">Platform:</span>
              <p className="text-white">DSCOVR Satellite</p>
            </div>
            <div>
              <span className="text-gray-400">Orbit:</span>
              <p className="text-white">L1 Lagrange Point</p>
            </div>
            <div>
              <span className="text-gray-400">Distance:</span>
              <p className="text-white">~1.5 million km from Earth</p>
            </div>
            <div>
              <span className="text-gray-400">Resolution:</span>
              <p className="text-white">2048 x 2048 pixels</p>
            </div>
          </div>
        </MissionControlPanel>

        <MissionControlPanel
          title="OBSERVATION NOTES"
          subtitle="About EPIC imagery"
          status="operational"
        >
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              EPIC provides a unique perspective of Earth from the L1 Lagrange point,
              offering a view of the fully illuminated Earth.
            </p>
            <p>
              Natural color images show Earth as it would appear to the human eye,
              while enhanced images use different spectral combinations to highlight
              atmospheric and surface features.
            </p>
            <p>
              Images are typically updated every 2-3 hours, providing near real-time
              monitoring of our planet's appearance from space.
            </p>
          </div>
        </MissionControlPanel>
      </div>
    </div>
  )
}

export default EarthObservation