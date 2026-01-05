// src/routes/consultation.routes.js - Consultation Routes
// ========================================================

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const {
  createConsultation,
  getAllConsultations,
  getConsultation,
  updateStatus,
  addNote,
  deleteConsultation,
  getMyConsultations
} = require('../controllers/consultation.controller');

const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// =====================================================
// VALIDATION RULES
// =====================================================

const createConsultationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Organization name cannot exceed 200 characters'),
  
  body('service')
    .trim()
    .notEmpty().withMessage('Service is required')
    .isIn(['strategic', 'digital', 'market', 'organizational', 'other'])
    .withMessage('Please select a valid service'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10-2000 characters')
];

const updateStatusValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'contacted', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Invalid user ID'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

const addNoteValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Note text is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Note must be between 1-1000 characters')
];

// =====================================================
// ROUTES
// =====================================================

/**
 * @route   POST /api/consultations
 * @desc    Create new consultation request
 * @access  Public
 */
router.post('/', createConsultationValidation, validate, createConsultation);

/**
 * @route   GET /api/consultations
 * @desc    Get all consultations with filtering
 * @access  Private (Admin/Partner)
 */
router.get('/', authenticate, requireAdmin, getAllConsultations);

/**
 * @route   GET /api/consultations/my/requests
 * @desc    Get user's own consultations
 * @access  Private (Client)
 */
router.get('/my/requests', authenticate, getMyConsultations);

/**
 * @route   GET /api/consultations/:id
 * @desc    Get single consultation
 * @access  Private
 */
router.get('/:id', authenticate, getConsultation);

/**
 * @route   PATCH /api/consultations/:id/status
 * @desc    Update consultation status
 * @access  Private (Admin/Partner)
 */
router.patch('/:id/status', authenticate, requireAdmin, updateStatusValidation, validate, updateStatus);

/**
 * @route   POST /api/consultations/:id/notes
 * @desc    Add note to consultation
 * @access  Private (Admin/Partner)
 */
router.post('/:id/notes', authenticate, requireAdmin, addNoteValidation, validate, addNote);

/**
 * @route   DELETE /api/consultations/:id
 * @desc    Delete consultation
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, deleteConsultation);

module.exports = router;
