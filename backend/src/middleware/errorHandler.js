/**
 * Global error handling middleware for NASA Mission Control API
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // NASA API specific errors
  if (err.message.includes('NASA API rate limit exceeded')) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests to NASA API. Please try again later.',
      retryAfter: 3600
    });
  }

  if (err.message.includes('Invalid NASA API key')) {
    return res.status(403).json({
      success: false,
      error: 'API key invalid',
      message: 'NASA API key is invalid or missing. Please check server configuration.'
    });
  }

  if (err.message.includes('NASA API is currently unavailable')) {
    return res.status(503).json({
      success: false,
      error: 'Service unavailable',
      message: 'NASA API is temporarily unavailable. Please try again later.'
    });
  }

  // Axios/HTTP errors
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.error?.message || err.response.statusText;

    return res.status(status).json({
      success: false,
      error: 'External API error',
      message: `NASA API returned ${status}: ${message}`
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message
    });
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid parameter',
      message: 'Invalid parameter format provided'
    });
  }

  // Timeout errors
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    return res.status(408).json({
      success: false,
      error: 'Request timeout',
      message: 'Request to NASA API timed out. Please try again.'
    });
  }

  // Network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Network error',
      message: 'Unable to connect to NASA API. Please try again later.'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong on our end. Please try again later.'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;