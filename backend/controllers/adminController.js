import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Events
    const totalEvents = await Event.countDocuments();

    // 2. Total Bookings (Confirmed/Paid)
    const totalBookings = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'pending'] }, // Including pending as they are reserved
      paymentStatus: 'paid' 
    });

    // 3. Real Sale Revenue
    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' }
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$totalAmount" } 
        } 
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 4. Total Users
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      totalEvents,
      totalBookings,
      totalRevenue,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
