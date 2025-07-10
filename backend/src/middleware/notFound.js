/**
 * 404 Not Found middleware for NASA Mission Control API
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      health: '/api/health',
      apod: '/api/apod',
      mars: '/api/mars',
      neows: '/api/neows',
      epic: '/api/epic'
    }
  });
};

module.exports = notFound;