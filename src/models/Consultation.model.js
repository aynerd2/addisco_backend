// src/models/Consultation.model.js - Consultation Mongoose Model
// ================================================================

const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  organization: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  
  service: {
    type: String,
    required: [true, 'Service is required'],
    enum: {
      values: ['strategic', 'digital', 'market', 'organizational', 'other'],
      message: '{VALUE} is not a valid service type'
    }
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  status: {
    type: String,
    enum: {
      values: ['pending', 'contacted', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: [{
    text: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  source: {
    type: String,
    enum: ['website', 'referral', 'direct', 'other'],
    default: 'website'
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==============================================
// INDEXES for better query performance
// ==============================================

consultationSchema.index({ email: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ service: 1 });
consultationSchema.index({ assignedTo: 1 });
consultationSchema.index({ priority: 1 });
consultationSchema.index({ createdAt: -1 });

// Compound index for admin dashboard queries
consultationSchema.index({ status: 1, createdAt: -1 });
consultationSchema.index({ service: 1, status: 1 });

// ==============================================
// VIRTUAL FIELDS
// ==============================================

consultationSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent';
});

consultationSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

consultationSchema.virtual('daysOpen').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ==============================================
// MIDDLEWARE
// ==============================================

// Update the updatedAt timestamp before saving
consultationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ==============================================
// INSTANCE METHODS
// ==============================================

/**
 * Add a note to consultation
 * @param {String} text - Note text
 * @param {ObjectId} userId - User adding the note
 */
consultationSchema.methods.addNote = function(text, userId) {
  this.notes.push({
    text,
    addedBy: userId,
    createdAt: new Date()
  });
  return this.save();
};

/**
 * Update consultation status
 * @param {String} newStatus - New status
 */
consultationSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Assign consultation to a user
 * @param {ObjectId} userId - User to assign
 */
consultationSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.updatedAt = Date.now();
  return this.save();
};

/**
 * Check if consultation is overdue (pending for more than 48 hours)
 * @returns {Boolean}
 */
consultationSchema.methods.isOverdue = function() {
  if (this.status !== 'pending') return false;
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return hoursSinceCreation > 48;
};

// ==============================================
// STATIC METHODS
// ==============================================

/**
 * Get consultations by status
 * @param {String} status - Status to filter by
 * @returns {Promise<Array>}
 */
consultationSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

/**
 * Get pending consultations
 * @returns {Promise<Array>}
 */
consultationSchema.statics.getPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

/**
 * Get overdue consultations
 * @returns {Promise<Array>}
 */
consultationSchema.statics.getOverdue = function() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return this.find({
    status: 'pending',
    createdAt: { $lt: twoDaysAgo }
  }).sort({ createdAt: 1 });
};

/**
 * Get consultations by service type
 * @param {String} service - Service type
 * @returns {Promise<Array>}
 */
consultationSchema.statics.getByService = function(service) {
  return this.find({ service }).sort({ createdAt: -1 });
};

/**
 * Get user's consultations by email
 * @param {String} email - User email
 * @returns {Promise<Array>}
 */
consultationSchema.statics.getByEmail = function(email) {
  return this.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
};

/**
 * Get statistics for dashboard
 * @returns {Promise<Object>}
 */
consultationSchema.statics.getStats = async function() {
  const [total, byStatus, byService] = await Promise.all([
    this.countDocuments(),
    this.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } }
    ])
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byService: byService.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

// ==============================================
// QUERY HELPERS
// ==============================================

consultationSchema.query.byStatus = function(status) {
  return this.where({ status });
};

consultationSchema.query.byService = function(service) {
  return this.where({ service });
};

consultationSchema.query.pending = function() {
  return this.where({ status: 'pending' });
};

consultationSchema.query.recent = function() {
  return this.sort({ createdAt: -1 });
};

// ==============================================
// EXPORT MODEL
// ==============================================

module.exports = mongoose.model('Consultation', consultationSchema);
