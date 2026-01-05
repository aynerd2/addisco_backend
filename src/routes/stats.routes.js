// src/routes/stats.routes.js - Statistics Routes
// ================================================

const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getUserStats
} = require('../controllers/stats.controller');

const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All stats routes require authentication and admin/partner role
router.use(authenticate);
router.use(requireRole('admin', 'partner'));

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin/Partner)
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   GET /api/stats/users
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get('/users', requireRole('admin'), getUserStats);

module.exports = router;
