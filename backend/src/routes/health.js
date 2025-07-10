const express = require('express');
const nasaApi = require('../services/nasaApi');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const healthData = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'operational',
        cache: 'operational',
        nasa_api: 'checking...'
      }
    };

    // Test NASA API connectivity
    try {
      await nasaApi.getAPOD();
      healthData.services.nasa_api = 'operational';
    } catch (error) {
      healthData.services.nasa_api = 'degraded';
      healthData.warnings = ['NASA API connectivity issues detected'];
    }

    // Get cache statistics
    const cacheStats = nasaApi.getCacheStats();
    healthData.cache = {
      status: 'operational',
      keys: cacheStats.keys,
      hits: cacheStats.stats.hits,
      misses: cacheStats.stats.misses,
      hitRate: cacheStats.stats.hits / (cacheStats.stats.hits + cacheStats.stats.misses) || 0
    };

    res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      message: 'Health check failed',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/health/cache/clear
 * @desc    Clear API cache (development only)
 * @access  Public (should be protected in production)
 */
router.post('/cache/clear', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Cache clearing is not allowed in production'
    });
  }

  try {
    nasaApi.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Cache clear failed',
      message: error.message
    });
  }
});

module.exports = router;