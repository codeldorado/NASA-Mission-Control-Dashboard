const express = require('express');
const nasaApi = require('../services/nasaApi');
const { validateDate, validateCount } = require('../utils/validators');
const router = express.Router();

/**
 * @route   GET /api/apod
 * @desc    Get Astronomy Picture of the Day
 * @access  Public
 * @params  date (YYYY-MM-DD), count (1-100), start_date, end_date
 */
router.get('/', async (req, res, next) => {
  try {
    const { date, count, start_date, end_date } = req.query;

    // Validate parameters
    if (date && !validateDate(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    if (count && !validateCount(count, 1, 100)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid count',
        message: 'Count must be between 1 and 100'
      });
    }

    if (start_date && !validateDate(start_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start_date format',
        message: 'Start date must be in YYYY-MM-DD format'
      });
    }

    if (end_date && !validateDate(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid end_date format',
        message: 'End date must be in YYYY-MM-DD format'
      });
    }

    // Validate date range
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: 'Start date must be before end date'
      });
    }

    const data = await nasaApi.getAPOD(date, count, start_date, end_date);

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: 'apod',
        cached: true, // This will be determined by the service layer
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/apod/today
 * @desc    Get today's Astronomy Picture of the Day
 * @access  Public
 */
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await nasaApi.getAPOD(today);

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: 'apod/today',
        date: today,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/apod/random
 * @desc    Get random Astronomy Pictures of the Day
 * @access  Public
 * @params  count (1-100, default: 1)
 */
router.get('/random', async (req, res, next) => {
  try {
    const count = parseInt(req.query.count) || 1;

    if (!validateCount(count, 1, 100)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid count',
        message: 'Count must be between 1 and 100'
      });
    }

    const data = await nasaApi.getAPOD(null, count);

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: 'apod/random',
        count: count,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/apod/range
 * @desc    Get APOD for a date range
 * @access  Public
 * @params  start_date (required), end_date (required)
 */
router.get('/range', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'Both start_date and end_date are required'
      });
    }

    if (!validateDate(start_date) || !validateDate(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        message: 'Dates must be in YYYY-MM-DD format'
      });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: 'Start date must be before end date'
      });
    }

    // Limit range to prevent excessive API calls
    const daysDiff = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    if (daysDiff > 100) {
      return res.status(400).json({
        success: false,
        error: 'Date range too large',
        message: 'Date range cannot exceed 100 days'
      });
    }

    const data = await nasaApi.getAPOD(null, null, start_date, end_date);

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: 'apod/range',
        start_date,
        end_date,
        days: daysDiff + 1,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;