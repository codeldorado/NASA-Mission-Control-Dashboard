import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    })
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    
    throw error
  }
)

// API service methods
export const apiService = {
  // Health check
  async getHealth() {
    const response = await api.get('/health')
    return response.data
  },

  // APOD (Astronomy Picture of the Day) endpoints
  apod: {
    async getToday() {
      const response = await api.get('/apod/today')
      return response.data
    },

    async getByDate(date) {
      const response = await api.get('/apod', { params: { date } })
      return response.data
    },

    async getRandom(count = 1) {
      const response = await api.get('/apod/random', { params: { count } })
      return response.data
    },

    async getRange(startDate, endDate) {
      const response = await api.get('/apod/range', { 
        params: { start_date: startDate, end_date: endDate } 
      })
      return response.data
    }
  },

  // Mars rover endpoints
  mars: {
    async getRovers() {
      const response = await api.get('/mars/rovers')
      return response.data
    },

    async getRoverManifest(rover) {
      const response = await api.get(`/mars/${rover}/manifest`)
      return response.data
    },

    async getRoverPhotos(rover, params = {}) {
      const response = await api.get(`/mars/${rover}/photos`, { params })
      return response.data
    },

    async getLatestPhotos(rover, camera = null) {
      const params = camera ? { camera } : {}
      const response = await api.get(`/mars/${rover}/latest`, { params })
      return response.data
    }
  },

  // Near Earth Objects endpoints
  neows: {
    async getFeed(startDate = null, endDate = null, detailed = false) {
      const params = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (detailed) params.detailed = 'true'
      
      const response = await api.get('/neows/feed', { params })
      return response.data
    },

    async getToday() {
      const response = await api.get('/neows/today')
      return response.data
    },

    async getById(asteroidId) {
      const response = await api.get(`/neows/object/${asteroidId}`)
      return response.data
    },

    async getHazardous() {
      const response = await api.get('/neows/hazardous')
      return response.data
    }
  },

  // EPIC Earth imagery endpoints
  epic: {
    async getImages(date = null, type = 'natural') {
      const params = { type }
      if (date) params.date = date
      
      const response = await api.get('/epic/images', { params })
      return response.data
    },

    async getLatest(type = 'natural') {
      const response = await api.get('/epic/latest', { params: { type } })
      return response.data
    },

    async getAvailableDates(type = 'natural') {
      const response = await api.get('/epic/dates', { params: { type } })
      return response.data
    },

    async getNatural() {
      const response = await api.get('/epic/natural')
      return response.data
    },

    async getEnhanced() {
      const response = await api.get('/epic/enhanced')
      return response.data
    }
  }
}

// Utility functions for API calls
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      console.warn(`Retry ${i + 1}/${maxRetries} for API call`)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

export const withCache = (() => {
  const cache = new Map()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  return (key, apiCall) => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for: ${key}`)
      return Promise.resolve(cached.data)
    }

    return apiCall().then(data => {
      cache.set(key, { data, timestamp: Date.now() })
      return data
    })
  }
})()

export default api