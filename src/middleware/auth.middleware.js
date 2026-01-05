// src/middleware/auth.middleware.js - Authentication & Authorization Middleware
// ==============================================================================

const { verifyToken } = require('../config/jwt');

/**
 * Authenticate user via JWT token
 * Extracts token from Authorization header and verifies it
 * Adds user data to req.user for use in controllers
 */
exports.authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required. Please provide a valid Bearer token.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    try {
      // Verify token and extract user data
      const decoded = verifyToken(token);
      
      // Add user data to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      
      // Continue to next middleware/controller
      next();

    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token. Please login again.',
        details: error.message
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Require specific role(s)
 * Use after authenticate middleware
 * @param {...String} roles - Allowed roles (admin, partner, client)
 * @returns {Function} Middleware function
 */
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. This action requires ${roles.join(' or ')} role.`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    // User has required role, continue
    next();
  };
};

/**
 * Require admin or partner role
 * Convenience middleware for common use case
 */
exports.requireAdmin = exports.requireRole('admin', 'partner');

/**
 * Check if user owns the resource
 * Used for operations where users can only access their own data
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 */
exports.requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Get resource owner ID
      const ownerId = await getResourceOwnerId(req);

      // Admin and partners can access any resource
      if (req.user.role === 'admin' || req.user.role === 'partner') {
        return next();
      }

      // Check if user owns the resource
      if (ownerId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to access this resource'
        });
      }

      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify resource ownership'
      });
    }
  };
};

/**
 * Optional authentication
 * Authenticates user if token is provided, but doesn't require it
 * Useful for routes that have both public and private features
 */
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    // Invalid token, but don't block the request
    console.log('Optional auth: Invalid token, continuing without authentication');
  }

  next();
};
