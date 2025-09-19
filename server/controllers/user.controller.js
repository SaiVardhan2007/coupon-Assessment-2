const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');
const { sendCouponEmail } = require('../utils/emailService');

// Redeem a coupon
const redeemCoupon = async (req, res) => {
  try {
    const { couponCode, couponId } = req.body;
    const userId = req.user.id;

    // Validate input - either couponCode or couponId is required
    if (!couponCode && !couponId) {
      return res.status(400).json({ 
        message: 'Either couponCode or couponId is required' 
      });
    }

    // Find the coupon by code or ID
    let coupon;
    if (couponId) {
      coupon = await Coupon.findById(couponId)
        .populate('assignedUsers', 'name email')
        .populate('usedBy.user', 'name email');
    } else {
      coupon = await Coupon.findOne({ couponName: couponCode })
        .populate('assignedUsers', 'name email')
        .populate('usedBy.user', 'name email');
    }

    if (!coupon) {
      return res.status(404).json({ 
        message: 'Coupon not found' 
      });
    }

    // Check if coupon exists and is active
    if (!coupon.isActive) {
      return res.status(400).json({ 
        message: 'Coupon is not active' 
      });
    }

    // Check if coupon has expired
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ 
        message: 'Coupon has expired' 
      });
    }

    // Check if coupon has reached maximum usage
    if (coupon.usageCount >= coupon.maxUses) {
      return res.status(400).json({ 
        message: 'Coupon usage limit has been reached' 
      });
    }

    // For 'specific' coupons, check if user is in assignedUsers list
    if (coupon.type === 'specific') {
      const isUserAssigned = coupon.assignedUsers.some(user => 
        user._id.toString() === userId.toString()
      );
      
      if (!isUserAssigned) {
        return res.status(403).json({ 
          message: 'You are not authorized to use this coupon' 
        });
      }
    }

    // Check if user has already used this coupon
    const hasUserUsedCoupon = coupon.usedBy.some(usage => 
      usage.user._id?.toString() === userId.toString() || usage.user.toString() === userId.toString()
    );

    if (hasUserUsedCoupon) {
      return res.status(400).json({ 
        message: 'You have already used this coupon' 
      });
    }

    // All validations passed - redeem the coupon
    coupon.usedBy.push({
      user: userId,
      usedAt: new Date()
    });
    coupon.usageCount += 1;

    // If this is a general coupon and it has reached max uses, deactivate it
    if (coupon.type === 'general' && coupon.usageCount >= coupon.maxUses) {
      coupon.isActive = false;
    }

    // Save the updated coupon
    await coupon.save();

    // Populate the updated coupon for response
    const updatedCoupon = await Coupon.findById(coupon._id)
      .populate('assignedUsers', 'name email')
      .populate('usedBy.user', 'name email')
      .populate('createdBy', 'name email');

    // Get user info for response
    const user = await User.findById(userId, 'name email');

    // Send redemption confirmation email (async, don't wait for it)
    sendCouponEmail(
      user.email,
      user.name,
      {
        couponName: updatedCoupon.couponName,
        discountValue: updatedCoupon.discountValue,
        discountType: updatedCoupon.discountType,
        description: updatedCoupon.description,
        type: updatedCoupon.type,
        expiryDate: updatedCoupon.expiryDate,
        maxUses: updatedCoupon.maxUses,
        usageCount: updatedCoupon.usageCount,
        isActive: updatedCoupon.isActive
      },
      'redemption'
    ).catch(emailError => {
      console.error('Failed to send redemption email:', emailError);
      // Don't fail the request if email fails
    });

    res.status(200).json({
      message: 'Coupon redeemed successfully',
      redemption: {
        coupon: {
          id: updatedCoupon._id,
          name: updatedCoupon.couponName,
          type: updatedCoupon.type,
          discountValue: updatedCoupon.discountValue,
          discountType: updatedCoupon.discountType,
          description: updatedCoupon.description,
          usageCount: updatedCoupon.usageCount,
          maxUses: updatedCoupon.maxUses,
          remainingUses: updatedCoupon.remainingUses,
          isActive: updatedCoupon.isActive,
          expiryDate: updatedCoupon.expiryDate
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        redeemedAt: new Date(),
        discountApplied: updatedCoupon.discountValue,
        discountType: updatedCoupon.discountType
      }
    });

  } catch (error) {
    console.error('Error redeeming coupon:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid coupon ID format' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while redeeming coupon' 
    });
  }
};

// Get user's available coupons
const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // optional filter by coupon type

    // Build query for available coupons
    const query = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ['$usageCount', '$maxUses'] }
    };

    // Add type filter if specified
    if (type && ['specific', 'general'].includes(type)) {
      query.type = type;
    }

    // Find all potentially available coupons
    const coupons = await Coupon.find(query)
      .populate('assignedUsers', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Filter coupons based on user eligibility
    const availableCoupons = coupons.filter(coupon => {
      // For specific coupons, user must be in assignedUsers
      if (coupon.type === 'specific') {
        const isAssigned = coupon.assignedUsers.some(user => 
          user._id.toString() === userId.toString()
        );
        if (!isAssigned) return false;
      }

      // Check if user has already used this coupon
      const hasUsed = coupon.usedBy.some(usage => 
        usage.user.toString() === userId.toString()
      );
      
      return !hasUsed;
    });

    res.json({
      message: 'Available coupons retrieved successfully',
      coupons: availableCoupons,
      count: availableCoupons.length
    });

  } catch (error) {
    console.error('Error fetching available coupons:', error);
    res.status(500).json({ 
      message: 'Server error while fetching available coupons' 
    });
  }
};

// Get user's redeemed coupons
const getRedeemedCoupons = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all coupons where user is in usedBy array
    const redeemedCoupons = await Coupon.find({
      'usedBy.user': userId
    })
    .populate('assignedUsers', 'name email')
    .populate('createdBy', 'name email')
    .sort({ 'usedBy.usedAt': -1 });

    // Transform the data to include redemption details
    const redemptionHistory = redeemedCoupons.map(coupon => {
      const userRedemption = coupon.usedBy.find(usage => 
        usage.user.toString() === userId.toString()
      );

      return {
        coupon: {
          id: coupon._id,
          name: coupon.couponName,
          type: coupon.type,
          discountValue: coupon.discountValue,
          discountType: coupon.discountType,
          description: coupon.description,
          expiryDate: coupon.expiryDate
        },
        redeemedAt: userRedemption?.usedAt,
        discountApplied: coupon.discountValue,
        discountType: coupon.discountType
      };
    });

    res.json({
      message: 'Redeemed coupons retrieved successfully',
      redemptions: redemptionHistory,
      count: redemptionHistory.length
    });

  } catch (error) {
    console.error('Error fetching redeemed coupons:', error);
    res.status(500).json({ 
      message: 'Server error while fetching redeemed coupons' 
    });
  }
};

// Get user's coupon statistics
const getUserCouponStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count total coupons available to user (specific + general)
    const totalAvailable = await Coupon.countDocuments({
      $or: [
        { 
          type: 'specific',
          assignedUsers: userId,
          isActive: true,
          expiryDate: { $gt: new Date() },
          $expr: { $lt: ['$usageCount', '$maxUses'] }
        },
        {
          type: 'general',
          isActive: true,
          expiryDate: { $gt: new Date() },
          $expr: { $lt: ['$usageCount', '$maxUses'] }
        }
      ]
    });

    // Count redeemed coupons
    const totalRedeemed = await Coupon.countDocuments({
      'usedBy.user': userId
    });

    // Count expired coupons that were assigned to user
    const expiredAssigned = await Coupon.countDocuments({
      assignedUsers: userId,
      $or: [
        { expiryDate: { $lte: new Date() } },
        { isActive: false }
      ]
    });

    // Calculate total savings
    const redeemedCoupons = await Coupon.find({
      'usedBy.user': userId
    });

    let totalSavings = 0;
    redeemedCoupons.forEach(coupon => {
      if (coupon.discountType === 'fixed') {
        totalSavings += coupon.discountValue;
      }
      // Note: For percentage discounts, we'd need the original purchase amount
      // to calculate actual savings, which isn't stored in this model
    });

    res.json({
      message: 'User coupon statistics retrieved successfully',
      stats: {
        totalAvailable,
        totalRedeemed,
        expiredAssigned,
        totalSavings: totalSavings.toFixed(2),
        redemptionRate: totalAvailable > 0 ? ((totalRedeemed / (totalRedeemed + totalAvailable)) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching user coupon stats:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user coupon statistics' 
    });
  }
};

module.exports = {
  redeemCoupon,
  getAvailableCoupons,
  getRedeemedCoupons,
  getUserCouponStats
};
