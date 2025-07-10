const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache with TTL from environment or default to 1 hour
const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
  checkperiod: 600 // Check for expired keys every 10 minutes
});

class NASAApiService {
  constructor() {
    this.baseURL = 'https://api.nasa.gov';
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'User-Agent': 'NASA-Mission-Control-Dashboard/1.0.0'
      }
    });

    // Request interceptor to add API key
    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        api_key: this.apiKey
      };
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('NASA API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message
        });
        throw error;
      }
    );
  }

  /**
   * Generic method to make cached API requests
   */
  async makeRequest(endpoint, params = {}, cacheKey = null, cacheTTL = null) {
    const finalCacheKey = cacheKey || `${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedData = cache.get(finalCacheKey);
    if (cachedData) {
      console.log(`Cache hit for: ${finalCacheKey}`);
      return cachedData;
    }

    try {
      console.log(`Making NASA API request to: ${endpoint}`);
      const response = await this.client.get(endpoint, { params });
      
      // Cache the response
      const ttl = cacheTTL || (parseInt(process.env.CACHE_TTL_SECONDS) || 3600);
      cache.set(finalCacheKey, response.data, ttl);
      
      return response.data;
    } catch (error) {
      // Handle specific NASA API errors
      if (error.response?.status === 429) {
        throw new Error('NASA API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 403) {
        throw new Error('Invalid NASA API key. Please check your configuration.');
      } else if (error.response?.status >= 500) {
        throw new Error('NASA API is currently unavailable. Please try again later.');
      }
      
      throw new Error(`NASA API request failed: ${error.message}`);
    }
  }

  /**
   * Get Astronomy Picture of the Day
   */
  async getAPOD(date = null, count = null, startDate = null, endDate = null) {
    const params = {};
    
    if (date) params.date = date;
    if (count) params.count = count;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const cacheKey = `apod_${JSON.stringify(params)}`;
    return await this.makeRequest('/planetary/apod', params, cacheKey);
  }

  /**
   * Get Mars Rover Photos
   */
  async getMarsRoverPhotos(rover = 'curiosity', sol = null, earthDate = null, camera = null, page = 1) {
    const params = { page };
    
    if (sol) params.sol = sol;
    if (earthDate) params.earth_date = earthDate;
    if (camera) params.camera = camera;

    const cacheKey = `mars_${rover}_${JSON.stringify(params)}`;
    return await this.makeRequest(`/mars-photos/api/v1/rovers/${rover}/photos`, params, cacheKey);
  }

  /**
   * Get Mars Rover Manifest
   */
  async getMarsRoverManifest(rover = 'curiosity') {
    const cacheKey = `mars_manifest_${rover}`;
    return await this.makeRequest(`/mars-photos/api/v1/rovers/${rover}`, {}, cacheKey, 86400); // Cache for 24 hours
  }

  /**
   * Get Near Earth Objects
   */
  async getNearEarthObjects(startDate = null, endDate = null, detailed = false) {
    const params = { detailed_destruction: detailed };
    
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const cacheKey = `neows_${JSON.stringify(params)}`;
    return await this.makeRequest('/neo/rest/v1/feed', params, cacheKey);
  }

  /**
   * Get specific Near Earth Object by ID
   */
  async getNearEarthObjectById(asteroidId) {
    const cacheKey = `neows_object_${asteroidId}`;
    return await this.makeRequest(`/neo/rest/v1/neo/${asteroidId}`, {}, cacheKey, 86400); // Cache for 24 hours
  }

  /**
   * Get EPIC Earth Imagery
   */
  async getEPICImages(date = null, type = 'natural') {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    
    const cacheKey = `epic_${type}_${targetDate}`;
    return await this.makeRequest(`/EPIC/api/${type}/date/${targetDate}`, {}, cacheKey);
  }

  /**
   * Get available EPIC dates
   */
  async getEPICAvailableDates(type = 'natural') {
    const cacheKey = `epic_dates_${type}`;
    return await this.makeRequest(`/EPIC/api/${type}/all`, {}, cacheKey, 86400); // Cache for 24 hours
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache() {
    cache.flushAll();
    console.log('NASA API cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: cache.keys().length,
      stats: cache.getStats()
    };
  }
}

module.exports = new NASAApiService();