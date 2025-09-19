const express = require('express');
const router = express.Router();
const Coupon = require('../models/coupon.model');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Get all active coupons (public route)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      isActive: true,
      expiryDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get coupon by ID
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem a coupon (requires authentication)
router.post('/:id/redeem', authenticateToken, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return res.status(400).json({ message: 'Coupon is not active' });
    }

    // Check if coupon is expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if usage limit is reached
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check if user has already used this coupon
    if (coupon.assignedUsers && coupon.assignedUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    // Redeem the coupon
    coupon.usageCount += 1;
    if (coupon.assignedUsers) {
      coupon.assignedUsers.push(req.user.id);
    } else {
      coupon.assignedUsers = [req.user.id];
    }

    await coupon.save();

    res.json({ 
      message: 'Coupon redeemed successfully',
      coupon: coupon
    });
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate coupon code
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return res.status(400).json({ message: 'Coupon is not active' });
    }

    // Check if coupon is expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if usage limit is reached
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    res.json({
      valid: true,
      coupon: coupon
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
