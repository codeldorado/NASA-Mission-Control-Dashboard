import React, { useEffect } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import LoadingSpinner from '../components/LoadingSpinner'

function MarsExplorer() {
  const { state, actions } = useAppContext()

  useEffect(() => {
    actions.setCurrentPage('mars')
  }, [])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-space gradient-text mb-4">
          Mars Explorer
        </h1>
        <p className="text-xl text-gray-300">
          Explore the Red Planet through NASA Mars rover cameras
        </p>
      </div>

      <div className="card-mission p-8 text-center">
        <div className="text-6xl mb-4">🔴</div>
        <h2 className="text-2xl font-bold mb-4">Mars Rover Photos</h2>
        <p className="text-gray-300 mb-6">
          Browse photos from Curiosity, Perseverance, Opportunity, and Spirit rovers
        </p>
        <div className="text-sm text-gray-400">
          Available rovers: {state.marsData.rovers.join(', ') || 'Loading...'}
        </div>
      </div>
    </div>
  )
}

export default MarsExplorer