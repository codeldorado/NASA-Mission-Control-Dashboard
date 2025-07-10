const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

// Cache for images (24 hours TTL)
const imageCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

/**
 * @route   GET /api/proxy/image
 * @desc    Proxy NASA images to avoid CORS and timeout issues
 * @access  Public
 * @params  url (required) - The NASA image URL to proxy
 */
router.get('/image', async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL parameter',
        message: 'Image URL is required'
      });
    }

    // Validate that it's a NASA URL for security
    const allowedDomains = [
      'apod.nasa.gov',
      'mars.nasa.gov',
      'api.nasa.gov',
      'epic.gsfc.nasa.gov',
      'photojournal.jpl.nasa.gov'
    ];

    const urlObj = new URL(url);
    const isAllowedDomain = allowedDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );

    if (!isAllowedDomain) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden domain',
        message: 'Only NASA domains are allowed'
      });
    }

    // Check cache first
    const cacheKey = `image_${Buffer.from(url).toString('base64')}`;
    const cachedImage = imageCache.get(cacheKey);
    
    if (cachedImage) {
      console.log(`Image cache hit for: ${url}`);
      res.set({
        'Content-Type': cachedImage.contentType,
        'Content-Length': cachedImage.data.length,
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'HIT'
      });
      return res.send(cachedImage.data);
    }

    console.log(`Proxying image request: ${url}`);

    // Fetch image from NASA
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'NASA-Mission-Control-Dashboard/1.0.0'
      }
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    const imageData = Buffer.from(response.data);

    // Cache the image
    imageCache.set(cacheKey, {
      data: imageData,
      contentType: contentType
    });

    // Set appropriate headers
    res.set({
      'Content-Type': contentType,
      'Content-Length': imageData.length,
      'Cache-Control': 'public, max-age=86400',
      'X-Cache': 'MISS'
    });

    res.send(imageData);

  } catch (error) {
    console.error('Image proxy error:', {
      url: req.query.url,
      error: error.message,
      status: error.response?.status
    });

    // Return a placeholder image or error response
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'Image request timed out'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        message: 'The requested image could not be found'
      });
    }

    next(error);
  }
});

/**
 * @route   GET /api/proxy/thumbnail
 * @desc    Generate or proxy thumbnail images
 * @access  Public
 * @params  url (required) - The NASA image URL to create thumbnail for
 * @params  size (optional) - Thumbnail size (default: 300)
 */
router.get('/thumbnail', async (req, res, next) => {
  try {
    const { url, size = 300 } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL parameter',
        message: 'Image URL is required'
      });
    }

    // For now, just proxy the original image
    // In a production environment, you might want to implement actual thumbnail generation
    req.query.url = url;
    return router.handle(req, res, next);

  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/proxy/cache/stats
 * @desc    Get image cache statistics
 * @access  Public
 */
router.get('/cache/stats', (req, res) => {
  const stats = imageCache.getStats();
  const keys = imageCache.keys();

  res.json({
    success: true,
    data: {
      stats: stats,
      cached_images: keys.length,
      cache_size_mb: Math.round(
        keys.reduce((total, key) => {
          const item = imageCache.get(key);
          return total + (item?.data?.length || 0);
        }, 0) / (1024 * 1024) * 100
      ) / 100
    }
  });
});

/**
 * @route   POST /api/proxy/cache/clear
 * @desc    Clear image cache
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

  imageCache.flushAll();
  
  res.json({
    success: true,
    message: 'Image cache cleared successfully'
  });
});

module.exports = router;