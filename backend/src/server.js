const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const apodRoutes = require('./routes/apod');
const marsRoutes = require('./routes/mars');
const neowsRoutes = require('./routes/neows');
const epicRoutes = require('./routes/epic');
const healthRoutes = require('./routes/health');
const proxyRoutes = require('./routes/proxy');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.nasa.gov"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/apod', apodRoutes);
app.use('/api/mars', marsRoutes);
app.use('/api/neows', neowsRoutes);
app.use('/api/epic', epicRoutes);
app.use('/api/proxy', proxyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NASA Mission Control Dashboard API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/api/health',
      apod: '/api/apod',
      mars: '/api/mars',
      neows: '/api/neows',
      epic: '/api/epic'
    },
    documentation: 'https://api.nasa.gov/'
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`NASA Mission Control API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`NASA API Key: ${process.env.NASA_API_KEY ? 'Configured' : 'Missing - using DEMO_KEY'}`);
});

module.exports = app;