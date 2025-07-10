const express = require('express');
const nasaApi = require('../services/nasaApi');
const { validateDate } = require('../utils/validators');
const router = express.Router();

const VALID_TYPES = ['natural', 'enhanced'];

/**
 * @route   GET /api/epic/images
 * @desc    Get EPIC Earth images for a specific date
 * @access  Public
 * @params  date, type (natural/enhanced)
 */
router.get('/images', async (req, res, next) => {
  try {
    const { date, type = 'natural' } = req.query;

    // Validate type
    if (!VALID_TYPES.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type',
        message: `Type must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    // Use today if no date provided
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;

    // Validate date
    if (!validateDate(targetDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Check if date is not in the future
    if (new Date(targetDate) > new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date',
        message: 'Date cannot be in the future'
      });
    }

    const data = await nasaApi.getEPICImages(targetDate, type.toLowerCase());

    // Enhance data with image URLs
    const enhancedData = data.map(image => ({
      ...image,
      image_url: `https://api.nasa.gov/EPIC/archive/${type.toLowerCase()}/${image.date.split(' ')[0].replace(/-/g, '/')}/png/${image.image}.png?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`,
      thumbnail_url: `https://api.nasa.gov/EPIC/archive/${type.toLowerCase()}/${image.date.split(' ')[0].replace(/-/g, '/')}/thumbs/${image.image}.jpg?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`,
      metadata: {
        sun_j2000_position: image.sun_j2000_position,
        lunar_j2000_position: image.lunar_j2000_position,
        attitude_quaternions: image.attitude_quaternions,
        coords: image.coords
      }
    }));

    res.json({
      success: true,
      data: enhancedData,
      meta: {
        endpoint: 'epic/images',
        date: targetDate,
        type: type.toLowerCase(),
        count: enhancedData.length,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/epic/latest
 * @desc    Get latest EPIC Earth images
 * @access  Public
 * @params  type (natural/enhanced)
 */
router.get('/latest', async (req, res, next) => {
  try {
    const { type = 'natural' } = req.query;

    if (!VALID_TYPES.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type',
        message: `Type must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    // Get available dates first
    const availableDates = await nasaApi.getEPICAvailableDates(type.toLowerCase());
    
    if (!availableDates || availableDates.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data available',
        message: 'No EPIC images available for the specified type'
      });
    }

    // Get the most recent date
    const latestDate = availableDates[0].date;
    const data = await nasaApi.getEPICImages(latestDate, type.toLowerCase());

    // Enhance data with image URLs
    const enhancedData = data.map(image => ({
      ...image,
      image_url: `https://api.nasa.gov/EPIC/archive/${type.toLowerCase()}/${image.date.split(' ')[0].replace(/-/g, '/')}/png/${image.image}.png?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`,
      thumbnail_url: `https://api.nasa.gov/EPIC/archive/${type.toLowerCase()}/${image.date.split(' ')[0].replace(/-/g, '/')}/thumbs/${image.image}.jpg?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`
    }));

    res.json({
      success: true,
      data: enhancedData,
      meta: {
        endpoint: 'epic/latest',
        date: latestDate,
        type: type.toLowerCase(),
        count: enhancedData.length,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/epic/dates
 * @desc    Get available EPIC image dates
 * @access  Public
 * @params  type (natural/enhanced)
 */
router.get('/dates', async (req, res, next) => {
  try {
    const { type = 'natural' } = req.query;

    if (!VALID_TYPES.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type',
        message: `Type must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    const data = await nasaApi.getEPICAvailableDates(type.toLowerCase());

    // Process dates to add additional info
    const processedDates = data.map(item => ({
      date: item.date,
      formatted_date: new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      day_of_year: Math.ceil((new Date(item.date) - new Date(new Date(item.date).getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      data: processedDates,
      meta: {
        endpoint: 'epic/dates',
        type: type.toLowerCase(),
        count: processedDates.length,
        date_range: {
          earliest: processedDates[processedDates.length - 1]?.date,
          latest: processedDates[0]?.date
        },
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/epic/enhanced
 * @desc    Get enhanced EPIC Earth images for today
 * @access  Public
 */
router.get('/enhanced', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await nasaApi.getEPICImages(today, 'enhanced');

    const enhancedData = data.map(image => ({
      ...image,
      image_url: `https://api.nasa.gov/EPIC/archive/enhanced/${image.date.split(' ')[0].replace(/-/g, '/')}/png/${image.image}.png?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`,
      thumbnail_url: `https://api.nasa.gov/EPIC/archive/enhanced/${image.date.split(' ')[0].replace(/-/g, '/')}/thumbs/${image.image}.jpg?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`
    }));

    res.json({
      success: true,
      data: enhancedData,
      meta: {
        endpoint: 'epic/enhanced',
        date: today,
        type: 'enhanced',
        count: enhancedData.length,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/epic/natural
 * @desc    Get natural EPIC Earth images for today
 * @access  Public
 */
router.get('/natural', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await nasaApi.getEPICImages(today, 'natural');

    const enhancedData = data.map(image => ({
      ...image,
      image_url: `https://api.nasa.gov/EPIC/archive/natural/${image.date.split(' ')[0].replace(/-/g, '/')}/png/${image.image}.png?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`,
      thumbnail_url: `https://api.nasa.gov/EPIC/archive/natural/${image.date.split(' ')[0].replace(/-/g, '/')}/thumbs/${image.image}.jpg?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`
    }));

    res.json({
      success: true,
      data: enhancedData,
      meta: {
        endpoint: 'epic/natural',
        date: today,
        type: 'natural',
        count: enhancedData.length,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;