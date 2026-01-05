// src/controllers/consultation.controller.js - Consultation Controller
// =====================================================================

const Consultation = require('../models/Consultation.model');
const { sendConsultationRequestEmail, sendStatusUpdateEmail } = require('../config/email');
// WhatsApp temporarily disabled - uncomment when ready
// const { sendConsultationWhatsAppNotification } = require('../config/whatsapp');

/**
 * @desc    Create new consultation request
 * @route   POST /api/consultations
 * @access  Public
 */
exports.createConsultation = async (req, res, next) => {
  try {
    const { name, email, phone, organization, service, message } = req.body;

    // Create consultation
    const consultation = await Consultation.create({
      name,
      email: email.toLowerCase(),
      phone,
      organization,
      service,
      message,
      source: 'website',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        referrer: req.get('referer')
      }
    });

    console.log(`✓ New consultation request: ${consultation._id} from ${email}`);

    // Send email notifications (don't wait)
    sendConsultationRequestEmail(consultation).catch(err => {
      console.error('Email notification failed:', err.message);
    });

    // WhatsApp notification - DISABLED FOR NOW
    // Uncomment when Twilio is configured
    // sendConsultationWhatsAppNotification(consultation).catch(err => {
    //   console.error('WhatsApp notification failed:', err.message);
    // });

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully. We will contact you within 24 hours.',
      data: {
        requestId: consultation._id,
        name: consultation.name,
        email: consultation.email,
        service: consultation.service,
        status: consultation.status,
        createdAt: consultation.createdAt
      }
    });

  } catch (error) {
    console.error('Create consultation error:', error);
    next(error);
  }
};

/**
 * @desc    Get all consultations with filtering and pagination
 * @route   GET /api/consultations
 * @access  Private (Admin/Partner)
 */
exports.getAllConsultations = async (req, res, next) => {
  try {
    const {
      status,
      service,
      priority,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (service) query.service = service;
    if (priority) query.priority = priority;
    
    // Search across multiple fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .populate('assignedTo', 'name email role')
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Consultation.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasMore: skip + consultations.length < total
        }
      }
    });

  } catch (error) {
    console.error('Get consultations error:', error);
    next(error);
  }
};

/**
 * @desc    Get single consultation by ID
 * @route   GET /api/consultations/:id
 * @access  Private
 */
exports.getConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('assignedTo', 'name email role phone')
      .populate('notes.addedBy', 'name email role');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    // Check permissions - clients can only view their own
    if (req.user.role === 'client' && consultation.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this consultation'
      });
    }

    res.json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Get consultation error:', error);
    next(error);
  }
};

/**
 * @desc    Update consultation status
 * @route   PATCH /api/consultations/:id/status
 * @access  Private (Admin/Partner)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, priority } = req.body;

    // Build update object
    const updateData = {
      updatedAt: Date.now()
    };
    
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    // Update consultation
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    console.log(`✓ Status updated: ${consultation._id} -> ${status}`);

    // Send status update email (don't wait)
    if (status) {
      sendStatusUpdateEmail(consultation).catch(err => {
        console.error('Status update email failed:', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: consultation
    });

  } catch (error) {
    console.error('Update status error:', error);
    next(error);
  }
};

/**
 * @desc    Add note to consultation
 * @route   POST /api/consultations/:id/notes
 * @access  Private (Admin/Partner)
 */
exports.addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Note text is required'
      });
    }

    // Add note
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text: text.trim(),
            addedBy: req.user.userId,
            createdAt: Date.now()
          }
        },
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('notes.addedBy', 'name email role');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    console.log(`✓ Note added to consultation: ${consultation._id}`);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: consultation
    });

  } catch (error) {
    console.error('Add note error:', error);
    next(error);
  }
};

/**
 * @desc    Delete consultation
 * @route   DELETE /api/consultations/:id
 * @access  Private (Admin only)
 */
exports.deleteConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    console.log(`✓ Consultation deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Consultation deleted successfully'
    });

  } catch (error) {
    console.error('Delete consultation error:', error);
    next(error);
  }
};

/**
 * @desc    Get user's own consultations
 * @route   GET /api/consultations/my/requests
 * @access  Private (Client)
 */
exports.getMyConsultations = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .select('-notes') // Exclude internal notes
      .lean();

    res.json({
      success: true,
      count: consultations.length,
      data: consultations
    });

  } catch (error) {
    console.error('Get my consultations error:', error);
    next(error);
  }
};