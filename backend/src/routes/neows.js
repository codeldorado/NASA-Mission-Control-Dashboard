const express = require('express');
const nasaApi = require('../services/nasaApi');
const { validateDate } = require('../utils/validators');
const router = express.Router();

/**
 * @route   GET /api/neows/feed
 * @desc    Get Near Earth Objects feed for date range
 * @access  Public
 * @params  start_date, end_date, detailed
 */
router.get('/feed', async (req, res, next) => {
  try {
    const { start_date, end_date, detailed = false } = req.query;

    // Default to today if no dates provided
    const today = new Date().toISOString().split('T')[0];
    const startDate = start_date || today;
    const endDate = end_date || today;

    // Validate dates
    if (!validateDate(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start_date format',
        message: 'Start date must be in YYYY-MM-DD format'
      });
    }

    if (!validateDate(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid end_date format',
        message: 'End date must be in YYYY-MM-DD format'
      });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: 'Start date must be before or equal to end date'
      });
    }

    // Limit range to 7 days (NASA API limitation)
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      return res.status(400).json({
        success: false,
        error: 'Date range too large',
        message: 'Date range cannot exceed 7 days'
      });
    }

    const data = await nasaApi.getNearEarthObjects(startDate, endDate, detailed === 'true');

    // Process data to add risk assessment
    const processedData = {
      ...data,
      risk_summary: {
        total_objects: data.element_count,
        potentially_hazardous: 0,
        close_approaches: 0,
        largest_object: null,
        closest_approach: null
      }
    };

    // Analyze objects for risk assessment
    Object.values(data.near_earth_objects).flat().forEach(obj => {
      if (obj.is_potentially_hazardous_asteroid) {
        processedData.risk_summary.potentially_hazardous++;
      }

      obj.close_approach_data.forEach(approach => {
        processedData.risk_summary.close_approaches++;

        // Track closest approach
        const distance = parseFloat(approach.miss_distance.kilometers);
        if (!processedData.risk_summary.closest_approach || 
            distance < processedData.risk_summary.closest_approach.distance) {
          processedData.risk_summary.closest_approach = {
            object_name: obj.name,
            distance: distance,
            date: approach.close_approach_date,
            velocity: parseFloat(approach.relative_velocity.kilometers_per_hour)
          };
        }
      });

      // Track largest object
      const diameter = obj.estimated_diameter.kilometers.estimated_diameter_max;
      if (!processedData.risk_summary.largest_object || 
          diameter > processedData.risk_summary.largest_object.diameter) {
        processedData.risk_summary.largest_object = {
          name: obj.name,
          diameter: diameter,
          is_hazardous: obj.is_potentially_hazardous_asteroid
        };
      }
    });

    res.json({
      success: true,
      data: processedData,
      meta: {
        endpoint: 'neows/feed',
        start_date: startDate,
        end_date: endDate,
        days: daysDiff + 1,
        detailed: detailed === 'true',
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/neows/today
 * @desc    Get Near Earth Objects for today
 * @access  Public
 */
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await nasaApi.getNearEarthObjects(today, today, false);

    // Quick stats for today
    const todayObjects = data.near_earth_objects[today] || [];
    const stats = {
      total_count: todayObjects.length,
      hazardous_count: todayObjects.filter(obj => obj.is_potentially_hazardous_asteroid).length,
      average_size: todayObjects.length > 0 
        ? todayObjects.reduce((sum, obj) => sum + obj.estimated_diameter.kilometers.estimated_diameter_max, 0) / todayObjects.length
        : 0
    };

    res.json({
      success: true,
      data: {
        ...data,
        daily_stats: stats
      },
      meta: {
        endpoint: 'neows/today',
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
 * @route   GET /api/neows/object/:id
 * @desc    Get specific Near Earth Object by ID
 * @access  Public
 */
router.get('/object/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid asteroid ID',
        message: 'Asteroid ID is required and must be a string'
      });
    }

    const data = await nasaApi.getNearEarthObjectById(id);

    // Add enhanced analysis
    const analysis = {
      risk_level: data.is_potentially_hazardous_asteroid ? 'HIGH' : 'LOW',
      size_category: categorizeSize(data.estimated_diameter.kilometers.estimated_diameter_max),
      next_approach: null,
      approach_count: data.close_approach_data.length
    };

    // Find next approach
    const now = new Date();
    const futureApproaches = data.close_approach_data
      .filter(approach => new Date(approach.close_approach_date) > now)
      .sort((a, b) => new Date(a.close_approach_date) - new Date(b.close_approach_date));

    if (futureApproaches.length > 0) {
      analysis.next_approach = {
        date: futureApproaches[0].close_approach_date,
        distance_km: parseFloat(futureApproaches[0].miss_distance.kilometers),
        velocity_kmh: parseFloat(futureApproaches[0].relative_velocity.kilometers_per_hour)
      };
    }

    res.json({
      success: true,
      data: {
        ...data,
        analysis
      },
      meta: {
        endpoint: `neows/object/${id}`,
        asteroid_id: id,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/neows/hazardous
 * @desc    Get potentially hazardous asteroids for today
 * @access  Public
 */
router.get('/hazardous', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await nasaApi.getNearEarthObjects(today, today, true);

    // Filter for hazardous objects only
    const hazardousObjects = Object.values(data.near_earth_objects)
      .flat()
      .filter(obj => obj.is_potentially_hazardous_asteroid)
      .map(obj => ({
        id: obj.id,
        name: obj.name,
        diameter_km: obj.estimated_diameter.kilometers.estimated_diameter_max,
        close_approach_data: obj.close_approach_data.map(approach => ({
          date: approach.close_approach_date,
          distance_km: parseFloat(approach.miss_distance.kilometers),
          velocity_kmh: parseFloat(approach.relative_velocity.kilometers_per_hour)
        }))
      }))
      .sort((a, b) => b.diameter_km - a.diameter_km); // Sort by size, largest first

    res.json({
      success: true,
      data: {
        hazardous_objects: hazardousObjects,
        count: hazardousObjects.length,
        date: today
      },
      meta: {
        endpoint: 'neows/hazardous',
        date: today,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to categorize asteroid size
function categorizeSize(diameterKm) {
  if (diameterKm < 0.001) return 'TINY';
  if (diameterKm < 0.01) return 'SMALL';
  if (diameterKm < 0.1) return 'MEDIUM';
  if (diameterKm < 1) return 'LARGE';
  return 'MASSIVE';
}

module.exports = router;