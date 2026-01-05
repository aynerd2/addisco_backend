// src/routes/user.routes.js - User Management Routes
// ===================================================

const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getPartners
} = require('../controllers/user.controller');

const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All user management routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/partners
 * @desc    Get all partners (for assignment dropdown)
 * @access  Private (Admin/Partner)
 */
router.get('/partners', requireRole('admin', 'partner'), getPartners);

/**
 * @route   GET /api/users
 * @desc    Get all users with filtering
 * @access  Private (Admin/Partner)
 */
router.get('/', requireRole('admin', 'partner'), getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin/Partner)
 */
router.get('/:id', requireRole('admin', 'partner'), getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/:id', requireRole('admin'), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;
