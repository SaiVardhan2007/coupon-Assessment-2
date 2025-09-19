const express = require('express');
const router = express.Router();
const Coupon = require('../models/coupon.model');
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

// Update coupon
router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const {
      title,
      code,
      description,
      discountType,
      discountValue,
      expiryDate,
      usageLimit,
      minimumOrderValue,
      status
    } = req.body;

    // Check if coupon code already exists (excluding current coupon)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    // Update fields
    if (title !== undefined) coupon.title = title;
    if (code !== undefined) coupon.code = code.toUpperCase();
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (minimumOrderValue !== undefined) coupon.minimumOrderValue = minimumOrderValue;
    if (status !== undefined) coupon.status = status;
    
    coupon.updatedBy = req.user.id;

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete coupon
router.delete('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get coupon statistics
router.get('/stats', async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments({});
    const activeCoupons = await Coupon.countDocuments({ 
      status: 'active',
      expiryDate: { $gte: new Date() }
    });
    const expiredCoupons = await Coupon.countDocuments({
      expiryDate: { $lt: new Date() }
    });
    const totalUsage = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);

    res.json({
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage: totalUsage[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk operations
router.post('/coupons/bulk-action', async (req, res) => {
  try {
    const { action, couponIds } = req.body;
    
    if (!action || !couponIds || !Array.isArray(couponIds)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    let result;
    
    switch (action) {
      case 'delete':
        result = await Coupon.deleteMany({ _id: { $in: couponIds } });
        break;
      case 'activate':
        result = await Coupon.updateMany(
          { _id: { $in: couponIds } },
          { status: 'active', updatedBy: req.user.id }
        );
        break;
      case 'deactivate':
        result = await Coupon.updateMany(
          { _id: { $in: couponIds } },
          { status: 'inactive', updatedBy: req.user.id }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({
      message: `Bulk ${action} completed`,
      affected: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
