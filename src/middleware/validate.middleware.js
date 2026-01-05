// src/middleware/validate.middleware.js - Request Validation Middleware
// ======================================================================

const { validationResult } = require('express-validator');

/**
 * Validate request based on express-validator rules
 * Checks for validation errors and returns formatted response
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format validation errors
    const formattedErrors = errors.array().map(err => ({
      field: err.param || err.path,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
      timestamp: new Date().toISOString()
    });
  }
  
  // No validation errors, continue
  next();
};

/**
 * Sanitize request body
 * Removes any fields that shouldn't be modified by users
 * @param {Array} fieldsToRemove - Fields to remove from req.body
 */
exports.sanitize = (fieldsToRemove = []) => {
  return (req, res, next) => {
    fieldsToRemove.forEach(field => {
      if (req.body[field]) {
        delete req.body[field];
      }
    });
    next();
  };
};
