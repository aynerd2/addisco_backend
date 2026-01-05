// src/middleware/rateLimiter.middleware.js - Rate Limiting Middleware
// ====================================================================

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Limits requests per IP address to prevent abuse
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for consultation requests
 * Prevents spam submissions
 */
const consultationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 consultation requests per hour
  message: {
    success: false,
    error: 'Too many consultation requests. You can submit up to 3 requests per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create custom rate limiter
 * @param {Number} windowMs - Time window in milliseconds
 * @param {Number} max - Maximum requests per window
 * @param {String} message - Error message
 */
const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: `${windowMs / 1000 / 60} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = limiter;
module.exports.authLimiter = authLimiter;
module.exports.consultationLimiter = consultationLimiter;
module.exports.createLimiter = createLimiter;
