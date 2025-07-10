import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './hooks/useAppContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const APOD = React.lazy(() => import('./pages/APOD'))
const MarsExplorer = React.lazy(() => import('./pages/MarsExplorer'))
const AsteroidTracker = React.lazy(() => import('./pages/AsteroidTracker'))
const EarthObservation = React.lazy(() => import('./pages/EarthObservation'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-space-gradient">
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apod" element={<APOD />} />
              <Route path="/mars" element={<MarsExplorer />} />
              <Route path="/asteroids" element={<AsteroidTracker />} />
              <Route path="/earth" element={<EarthObservation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </AppProvider>
  )
}

export default App