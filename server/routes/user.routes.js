const express = require('express');
const { authenticateToken, requireAdmin, requireAuth } = require('../middleware/auth.middleware');
const { redeemCoupon, getAvailableCoupons, getRedeemedCoupons, getUserCouponStats } = require('../controllers/user.controller');

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
