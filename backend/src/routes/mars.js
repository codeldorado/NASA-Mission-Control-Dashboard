const express = require('express');
const nasaApi = require('../services/nasaApi');
const { validateDate, validateSol, validateCamera } = require('../utils/validators');
const router = express.Router();

const VALID_ROVERS = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
const VALID_CAMERAS = {
  curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],
  opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  perseverance: ['EDL_RUCAM', 'EDL_RDCAM', 'EDL_DDCAM', 'EDL_PUCAM1', 'EDL_PUCAM2', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_LEFT', 'MCZ_RIGHT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A', 'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT', 'SKYCAM', 'SHERLOC_WATSON']
};

/**
 * @route   GET /api/mars/rovers
 * @desc    Get list of available Mars rovers
 * @access  Public
 */
router.get('/rovers', (req, res) => {
  res.json({
    success: true,
    data: {
      rovers: VALID_ROVERS,
      cameras: VALID_CAMERAS
    },
    meta: {
      endpoint: 'mars/rovers',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route   GET /api/mars/:rover/manifest
 * @desc    Get Mars rover mission manifest
 * @access  Public
 */
router.get('/:rover/manifest', async (req, res, next) => {
  try {
    const { rover } = req.params;

    if (!VALID_ROVERS.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rover',
        message: `Rover must be one of: ${VALID_ROVERS.join(', ')}`
      });
    }

    const data = await nasaApi.getMarsRoverManifest(rover.toLowerCase());

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: `mars/${rover}/manifest`,
        rover: rover.toLowerCase(),
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/mars/:rover/photos
 * @desc    Get Mars rover photos
 * @access  Public
 * @params  sol, earth_date, camera, page
 */
router.get('/:rover/photos', async (req, res, next) => {
  try {
    const { rover } = req.params;
    const { sol, earth_date, camera, page = 1 } = req.query;

    // Validate rover
    if (!VALID_ROVERS.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rover',
        message: `Rover must be one of: ${VALID_ROVERS.join(', ')}`
      });
    }

    // Validate that either sol or earth_date is provided
    if (!sol && !earth_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameter',
        message: 'Either sol or earth_date parameter is required'
      });
    }

    // Validate sol if provided
    if (sol && !validateSol(sol)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sol',
        message: 'Sol must be a positive integer'
      });
    }

    // Validate earth_date if provided
    if (earth_date && !validateDate(earth_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid earth_date format',
        message: 'Earth date must be in YYYY-MM-DD format'
      });
    }

    // Validate camera if provided
    if (camera && !validateCamera(camera, rover.toLowerCase(), VALID_CAMERAS)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid camera',
        message: `Camera must be one of: ${VALID_CAMERAS[rover.toLowerCase()].join(', ')}`
      });
    }

    // Validate page
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page',
        message: 'Page must be a positive integer'
      });
    }

    const data = await nasaApi.getMarsRoverPhotos(
      rover.toLowerCase(),
      sol,
      earth_date,
      camera?.toUpperCase(),
      pageNum
    );

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: `mars/${rover}/photos`,
        rover: rover.toLowerCase(),
        sol: sol || null,
        earth_date: earth_date || null,
        camera: camera?.toUpperCase() || null,
        page: pageNum,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/mars/:rover/latest
 * @desc    Get latest photos from Mars rover
 * @access  Public
 * @params  camera
 */
router.get('/:rover/latest', async (req, res, next) => {
  try {
    const { rover } = req.params;
    const { camera } = req.query;

    if (!VALID_ROVERS.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rover',
        message: `Rover must be one of: ${VALID_ROVERS.join(', ')}`
      });
    }

    if (camera && !validateCamera(camera, rover.toLowerCase(), VALID_CAMERAS)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid camera',
        message: `Camera must be one of: ${VALID_CAMERAS[rover.toLowerCase()].join(', ')}`
      });
    }

    // First get the manifest to find the latest sol
    const manifest = await nasaApi.getMarsRoverManifest(rover.toLowerCase());
    const latestSol = manifest.photo_manifest.max_sol;

    // Then get photos for the latest sol
    const data = await nasaApi.getMarsRoverPhotos(
      rover.toLowerCase(),
      latestSol,
      null,
      camera?.toUpperCase(),
      1
    );

    res.json({
      success: true,
      data: data,
      meta: {
        endpoint: `mars/${rover}/latest`,
        rover: rover.toLowerCase(),
        latest_sol: latestSol,
        camera: camera?.toUpperCase() || null,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;