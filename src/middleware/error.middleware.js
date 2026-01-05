// src/middleware/error.middleware.js - Error Handling Middleware
// ===============================================================

/**
 * Global error handler
 * Catches all errors and sends formatted response
 * Must be the last middleware in the stack
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  // =====================================================
  // MONGOOSE ERRORS
  // =====================================================

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    errors = [{
      field,
      message: `This ${field} is already registered`
    }];
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = [{
      field: err.path,
      message: 'Invalid ID format'
    }];
  }

  // =====================================================
  // JWT ERRORS
  // =====================================================

  // JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  // JWT expired token
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please login again.';
  }

  // =====================================================
  // CUSTOM ERRORS
  // =====================================================

  // Not found error
  if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = err.message || 'Resource not found';
  }

  // Unauthorized error
  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = err.message || 'Unauthorized access';
  }

  // Forbidden error
  if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = err.message || 'Access forbidden';
  }

  // =====================================================
  // SEND ERROR RESPONSE
  // =====================================================

  res.status(statusCode).json({
    success: false,
    error: message,
    errors,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    }),
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

/**
 * Not found handler
 * Handles requests to non-existent routes
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.name = 'NotFoundError';
  next(error);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 */
exports.createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
