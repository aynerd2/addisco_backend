// src/server.js - Main Server Entry Point
// ==============================================
// Addisco Consulting Platform - Backend API
// McKinsey-style Management Consulting Platform
// ==============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import database connection
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const consultationRoutes = require('./routes/consultation.routes');
const userRoutes = require('./routes/user.routes');
const statsRoutes = require('./routes/stats.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const rateLimiter = require('./middleware/rateLimiter.middleware');

// Initialize Express app
const app = express();

// ==============================================
// MIDDLEWARE CONFIGURATION
// ==============================================

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration - Support multiple origins
// Parse allowed origins from environment variable
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

console.log('🔒 CORS Configuration:');
console.log('   Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      // Return only the matching origin (not all origins!)
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting for API routes
app.use('/api/', rateLimiter);

// ==============================================
// DATABASE CONNECTION
// ==============================================

connectDB();

// ==============================================
// HEALTH CHECK ROUTE
// ==============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Addisco API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// ==============================================
// ROOT ROUTE
// ==============================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Addisco Consulting Platform API',
    version: '1.0.0',
    documentation: {
      health: '/health',
      authentication: '/api/auth',
      consultations: '/api/consultations',
      users: '/api/users',
      statistics: '/api/stats'
    },
    contact: {
      email: 'info@addisco.ng',
      website: 'https://addisco.ng'
    }
  });
});

// ==============================================
// API ROUTES
// ==============================================

app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// ==============================================
// 404 HANDLER - Route Not Found
// ==============================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ==============================================
// ERROR HANDLER (Must be last middleware)
// ==============================================

app.use(errorHandler);

// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ADDISCO CONSULTING PLATFORM API');
  console.log('='.repeat(60));
  console.log(`📡 Server Status: Running`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('📊 Configuration:');
  console.log(`   ✓ Database: MongoDB`);
  console.log(`   ${process.env.SMTP_USER ? '✓' : '✗'} Email: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);
  console.log(`   ${process.env.TWILIO_ACCOUNT_SID ? '✓' : '✗'} WhatsApp: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Not configured'}`);
  console.log('='.repeat(60));
  console.log('📝 API Endpoints:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/me');
  console.log('   POST   /api/consultations');
  console.log('   GET    /api/consultations');
  console.log('   GET    /api/stats/dashboard');
  console.log('='.repeat(60));
  console.log('✨ Server is ready to accept connections!\n');
});

// ==============================================
// GRACEFUL SHUTDOWN
// ==============================================

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('✓ HTTP server closed');
    const mongoose = require('mongoose');
    mongoose.connection.close(false, () => {
      console.log('✓ MongoDB connection closed');
      console.log('✓ Server shutdown complete');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('✗ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});

// Export for testing
module.exports = app;