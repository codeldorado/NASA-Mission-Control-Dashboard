import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { apiService } from '../services/api'

// Initial state
const initialState = {
  // App status
  isLoading: false,
  error: null,
  apiHealth: null,
  
  // Data
  apodData: null,
  marsData: {
    rovers: [],
    currentRover: 'curiosity',
    photos: [],
    manifest: null
  },
  asteroidsData: {
    feed: null,
    hazardous: [],
    selectedAsteroid: null
  },
  earthData: {
    images: [],
    availableDates: [],
    currentType: 'natural'
  },
  
  // UI state
  sidebarOpen: false,
  currentPage: 'dashboard',
  notifications: [],
  

}

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_API_HEALTH: 'SET_API_HEALTH',
  SET_APOD_DATA: 'SET_APOD_DATA',
  SET_MARS_DATA: 'SET_MARS_DATA',
  SET_ASTEROIDS_DATA: 'SET_ASTEROIDS_DATA',
  SET_EARTH_DATA: 'SET_EARTH_DATA',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
}

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case actionTypes.SET_API_HEALTH:
      return { ...state, apiHealth: action.payload }
    
    case actionTypes.SET_APOD_DATA:
      return { ...state, apodData: action.payload }
    
    case actionTypes.SET_MARS_DATA:
      return { 
        ...state, 
        marsData: { ...state.marsData, ...action.payload }
      }
    
    case actionTypes.SET_ASTEROIDS_DATA:
      return { 
        ...state, 
        asteroidsData: { ...state.asteroidsData, ...action.payload }
      }
    
    case actionTypes.SET_EARTH_DATA:
      return { 
        ...state, 
        earthData: { ...state.earthData, ...action.payload }
      }
    
    case actionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen }
    
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload }
    
    case actionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload]
      }
    
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }

    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    
    setApiHealth: (health) => dispatch({ type: actionTypes.SET_API_HEALTH, payload: health }),
    
    setApodData: (data) => dispatch({ type: actionTypes.SET_APOD_DATA, payload: data }),
    
    setMarsData: (data) => dispatch({ type: actionTypes.SET_MARS_DATA, payload: data }),
    
    setAsteroidsData: (data) => dispatch({ type: actionTypes.SET_ASTEROIDS_DATA, payload: data }),
    
    setEarthData: (data) => dispatch({ type: actionTypes.SET_EARTH_DATA, payload: data }),
    
    toggleSidebar: () => dispatch({ type: actionTypes.TOGGLE_SIDEBAR }),
    
    setCurrentPage: (page) => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
    
    addNotification: (notification) => {
      const id = Date.now().toString()
      dispatch({ 
        type: actionTypes.ADD_NOTIFICATION, 
        payload: { id, ...notification }
      })
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id })
      }, 5000)
    },
    
    removeNotification: (id) => dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id })
  }

  // API methods with error handling
  const api = {
    async checkHealth() {
      try {
        actions.setLoading(true)
        const health = await apiService.getHealth()
        actions.setApiHealth(health.data)
        return health
      } catch (error) {
        actions.setError(error.message)
        actions.addNotification({
          type: 'error',
          title: 'API Health Check Failed',
          message: error.message
        })
        throw error
      } finally {
        actions.setLoading(false)
      }
    },

    async fetchApodToday() {
      try {
        actions.setLoading(true)
        const apod = await apiService.apod.getToday()
        actions.setApodData(apod.data)
        return apod
      } catch (error) {
        actions.setError(error.message)
        throw error
      } finally {
        actions.setLoading(false)
      }
    },

    async fetchMarsRovers() {
      try {
        const rovers = await apiService.mars.getRovers()
        actions.setMarsData({ rovers: rovers.data.rovers })
        return rovers
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },

    async fetchAsteroidsToday() {
      try {
        const asteroids = await apiService.neows.getToday()
        actions.setAsteroidsData({ feed: asteroids.data })
        return asteroids
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },

    async fetchEarthImages() {
      try {
        const images = await apiService.epic.getLatest()
        actions.setEarthData({ images: images.data })
        return images
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    }
  }

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await api.checkHealth()
        actions.addNotification({
          type: 'success',
          title: 'Mission Control Online',
          message: 'All systems operational'
        })
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [])

  const value = {
    state,
    actions,
    api
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export default AppContext