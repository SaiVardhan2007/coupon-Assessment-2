const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getCouponStats,
  createCoupon,
  getCoupons,
  getCouponDetails,
  toggleCouponStatus
} = require('../controllers/admin.controller');

// Apply admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Coupon statistics route
router.get('/coupons/stats', getCouponStats);

// Coupon management routes
router.get('/coupons', getCoupons);
router.get('/coupons/:id', getCouponDetails);
router.post('/coupons', createCoupon);
router.put('/coupons/toggle/:id', toggleCouponStatus);

module.exports = router;
