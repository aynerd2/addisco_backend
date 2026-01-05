// src/controllers/stats.controller.js - Statistics Controller
// ============================================================

const Consultation = require('../models/Consultation.model');
const User = require('../models/User.model');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/stats/dashboard
 * @access  Private (Admin/Partner)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get overall counts
    const [
      totalConsultations,
      pendingCount,
      contactedCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      totalUsers
    ] = await Promise.all([
      Consultation.countDocuments(),
      Consultation.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'contacted' }),
      Consultation.countDocuments({ status: 'in-progress' }),
      Consultation.countDocuments({ status: 'completed' }),
      Consultation.countDocuments({ status: 'cancelled' }),
      User.countDocuments()
    ]);

    // Get consultations by service
    const byService = await Consultation.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get consultations by priority
    const byPriority = await Consultation.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent consultations
    const recentConsultations = await Consultation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name email')
      .select('name email service status createdAt')
      .lean();

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Consultation.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get overdue consultations (pending for more than 48 hours)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const overdueCount = await Consultation.countDocuments({
      status: 'pending',
      createdAt: { $lt: twoDaysAgo }
    });

    res.json({
      success: true,
      data: {
        overview: {
          total: totalConsultations,
          pending: pendingCount,
          contacted: contactedCount,
          inProgress: inProgressCount,
          completed: completedCount,
          cancelled: cancelledCount,
          overdue: overdueCount,
          totalUsers
        },
        byService: byService.map(item => ({
          service: item._id,
          count: item.count
        })),
        byPriority: byPriority.map(item => ({
          priority: item._id,
          count: item.count
        })),
        recentConsultations,
        monthlyTrend: monthlyTrend.map(item => ({
          year: item._id.year,
          month: item._id.month,
          count: item.count
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    next(error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/stats/users
 * @access  Private (Admin)
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const [totalUsers, adminCount, partnerCount, clientCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'partner' }),
      User.countDocuments({ role: 'client' })
    ]);

    res.json({
      success: true,
      data: {
        total: totalUsers,
        byRole: {
          admin: adminCount,
          partner: partnerCount,
          client: clientCount
        }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    next(error);
  }
};
