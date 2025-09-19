const express = require('express');
const { authenticateToken, requireAdmin, requireAuth } = require('../middleware/auth.middleware');
const { redeemCoupon, getAvailableCoupons, getRedeemedCoupons, getUserCouponStats } = require('../controllers/user.controller');
const Coupon = require('../models/coupon.model');

const router = express.Router();

// Coupon-related routes
// Redeem a coupon
router.post('/coupons/redeem', authenticateToken, redeemCoupon);

// Get available coupons for the user
router.get('/coupons/available', authenticateToken, getAvailableCoupons);

// Get user's redeemed coupons
router.get('/coupons/redeemed', authenticateToken, getRedeemedCoupons);

// Get user's coupon statistics
router.get('/coupons/stats', authenticateToken, getUserCouponStats);

// Public route - get user profile (requires authentication)
router.get('/profile', authenticateToken, requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

// Get user's assigned coupons
router.get('/coupons', authenticateToken, async (req, res) => {
  try {
    const coupons = await Coupon.find({
      assignedUsers: req.user.id
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get user's usage history
router.get('/usage-history', authenticateToken, async (req, res) => {
  try {
    // In a real application, you would have a separate UsageHistory model
    // For now, we'll return the coupons the user has used
    const usedCoupons = await Coupon.find({
      assignedUsers: req.user.id
    }).sort({ updatedAt: -1 });
    
    // Transform to usage history format
    const usageHistory = usedCoupons.map(coupon => ({
      coupon: coupon,
      couponCode: coupon.code,
      usedAt: coupon.updatedAt,
      discountApplied: coupon.discountValue,
      discountType: coupon.discountType
    }));
    
    res.json(usageHistory);
  } catch (error) {
    console.error('Error fetching usage history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments({
      assignedUsers: req.user.id
    });
    
    const activeCoupons = await Coupon.countDocuments({
      assignedUsers: req.user.id,
      status: 'active',
      expiryDate: { $gte: new Date() }
    });
    
    const expiredCoupons = await Coupon.countDocuments({
      assignedUsers: req.user.id,
      expiryDate: { $lt: new Date() }
    });
    
    res.json({
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      usedCoupons: totalCoupons - activeCoupons
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only route - get all users
router.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
  // In a real application, this would fetch users from the database
  res.json({
    success: true,
    message: 'Users retrieved successfully (Admin only)',
    data: {
      users: [
        {
          id: 'admin-1',
          name: 'Administrator',
          email: process.env.ADMIN_EMAIL,
          role: 'admin'
        }
      ]
    }
  });
});

// Protected route - verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
