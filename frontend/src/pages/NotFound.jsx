import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-8">🛸</div>
        <h1 className="text-6xl font-bold font-space gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Mission Not Found</h2>
        <p className="text-gray-300 mb-8 max-w-md">
          Houston, we have a problem. The page you're looking for has drifted into deep space.
        </p>
        <Link to="/" className="btn-mission">
          Return to Mission Control
        </Link>
      </div>
    </div>
  )
}

export default NotFound