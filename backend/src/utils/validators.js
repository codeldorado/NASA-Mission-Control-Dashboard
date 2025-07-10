/**
 * Validation utilities for NASA Mission Control API
 */

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid date format
 */
function validateDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  // Check format with regex
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-').map(Number);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

/**
 * Validate count parameter
 * @param {string|number} count - Count value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - True if valid count
 */
function validateCount(count, min = 1, max = 100) {
  const num = parseInt(count);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate Mars rover sol (Martian day)
 * @param {string|number} sol - Sol value to validate
 * @returns {boolean} - True if valid sol
 */
function validateSol(sol) {
  const num = parseInt(sol);
  return !isNaN(num) && num >= 0 && num <= 10000; // Reasonable upper limit
}

/**
 * Validate Mars rover camera
 * @param {string} camera - Camera name to validate
 * @param {string} rover - Rover name
 * @param {object} validCameras - Object containing valid cameras for each rover
 * @returns {boolean} - True if valid camera for the rover
 */
function validateCamera(camera, rover, validCameras) {
  if (!camera || typeof camera !== 'string') {
    return false;
  }

  const roverCameras = validCameras[rover.toLowerCase()];
  if (!roverCameras) {
    return false;
  }

  return roverCameras.includes(camera.toUpperCase());
}

/**
 * Validate asteroid ID
 * @param {string} asteroidId - Asteroid ID to validate
 * @returns {boolean} - True if valid asteroid ID format
 */
function validateAsteroidId(asteroidId) {
  if (!asteroidId || typeof asteroidId !== 'string') {
    return false;
  }

  // NASA asteroid IDs are typically numeric strings
  return /^\d+$/.test(asteroidId) && asteroidId.length >= 1 && asteroidId.length <= 10;
}

/**
 * Validate page number
 * @param {string|number} page - Page number to validate
 * @returns {boolean} - True if valid page number
 */
function validatePage(page) {
  const num = parseInt(page);
  return !isNaN(num) && num >= 1 && num <= 1000; // Reasonable upper limit
}

/**
 * Validate date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} maxDays - Maximum allowed days in range
 * @returns {object} - Validation result with isValid and message
 */
function validateDateRange(startDate, endDate, maxDays = 7) {
  if (!validateDate(startDate)) {
    return { isValid: false, message: 'Invalid start date format' };
  }

  if (!validateDate(endDate)) {
    return { isValid: false, message: 'Invalid end date format' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { isValid: false, message: 'Start date must be before or equal to end date' };
  }

  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (daysDiff > maxDays) {
    return { isValid: false, message: `Date range cannot exceed ${maxDays} days` };
  }

  return { isValid: true, days: daysDiff + 1 };
}

/**
 * Validate query parameters for API endpoints
 * @param {object} params - Parameters to validate
 * @param {object} rules - Validation rules
 * @returns {object} - Validation result
 */
function validateQueryParams(params, rules) {
  const errors = [];

  for (const [key, rule] of Object.entries(rules)) {
    const value = params[key];

    // Check if required parameter is missing
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip validation if parameter is not provided and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Apply validation function
    if (rule.validator && !rule.validator(value)) {
      errors.push(rule.message || `Invalid ${key}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
function sanitizeString(input, maxLength = 100) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validate and sanitize API key
 * @param {string} apiKey - API key to validate
 * @returns {boolean} - True if valid API key format
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // NASA API keys are typically 40 characters long
  return apiKey.length >= 20 && apiKey.length <= 50 && /^[a-zA-Z0-9]+$/.test(apiKey);
}

module.exports = {
  validateDate,
  validateCount,
  validateSol,
  validateCamera,
  validateAsteroidId,
  validatePage,
  validateDateRange,
  validateQueryParams,
  sanitizeString,
  validateApiKey
};