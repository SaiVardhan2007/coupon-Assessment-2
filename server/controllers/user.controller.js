const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');
const { sendCouponEmail } = require('../utils/emailService');

const redeemCoupon = async (req, res) => {
  try {
    const { couponName } = req.body;
    const userId = req.user.id;

    console.log('Coupon redemption request:', {
      couponName,
      userId,
      userRole: req.user.role,
      userEmail: req.user.email
    });

    if (!couponName) {
      return res.status(400).json({ 
        message: 'couponName is required' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    console.log('Searching for coupon:', couponName);
    const coupon = await Coupon.findOne({ couponName })
      .populate('assignedUsers', 'name email')
      .populate('usedBy.user', 'name email');

    console.log('Coupon found:', coupon ? {
      id: coupon._id,
      name: coupon.couponName,
      type: coupon.type,
      isActive: coupon.isActive,
      usageCount: coupon.usageCount,
      maxUses: coupon.maxUses
    } : 'Not found');

    if (!coupon) {
      return res.status(404).json({ 
        message: 'Coupon not found' 
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ 
        message: 'Coupon is not active' 
      });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ 
        message: 'Coupon has expired' 
      });
    }

    if (coupon.type === 'specific') {
      // For specific coupons, check if user is in assignedUsers
      const isUserAssigned = coupon.assignedUsers.some(user => 
        user._id.toString() === userId.toString()
      );
      
      if (!isUserAssigned) {
        return res.status(403).json({ 
          message: 'You are not authorized to use this coupon' 
        });
      }

      // Check if user has already used this coupon
      const hasUserUsedCoupon = coupon.usedBy.some(usage => 
        usage.user.toString() === userId.toString()
      );

      if (hasUserUsedCoupon) {
        return res.status(400).json({ 
          message: 'You have already used this coupon' 
        });
      }

    } else if (coupon.type === 'general') {
      if (coupon.usageCount >= coupon.maxUses) {
        return res.status(400).json({ 
          message: 'Coupon usage limit has been reached' 
        });
      }

      const hasUserUsedCoupon = coupon.usedBy.some(usage => 
        usage.user.toString() === userId.toString()
      );

      if (hasUserUsedCoupon) {
        return res.status(400).json({ 
          message: 'You have already used this coupon' 
        });
      }
    }

    coupon.usedBy.push({
      user: userId,
      usedAt: new Date()
    });
    coupon.usageCount += 1;

    if (coupon.type === 'general' && coupon.usageCount >= coupon.maxUses) {
      coupon.isActive = false;
    }

    // Save the updated coupon
    await coupon.save();

    const user = await User.findById(userId, 'name email');
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const updatedCoupon = await Coupon.findById(coupon._id)
      .populate('assignedUsers', 'name email')
      .populate('usedBy.user', 'name email');

    sendCouponEmail(
      user.email,
      user.name,
      {
        couponName: updatedCoupon.couponName,
        type: updatedCoupon.type,
        expiryDate: updatedCoupon.expiryDate,
        maxUses: updatedCoupon.maxUses,
        usageCount: updatedCoupon.usageCount,
        isActive: updatedCoupon.isActive
      },
      'redemption'
    ).catch(emailError => {
      console.error('Failed to send redemption email:', emailError);
    });

    res.status(200).json({
      message: 'Coupon redeemed successfully',
      redemption: {
        coupon: {
          id: updatedCoupon._id,
          name: updatedCoupon.couponName,
          type: updatedCoupon.type,
          usageCount: updatedCoupon.usageCount,
          maxUses: updatedCoupon.maxUses,
          isActive: updatedCoupon.isActive,
          expiryDate: updatedCoupon.expiryDate
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        redeemedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error redeeming coupon:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
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
      message: 'Server error while redeeming coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const query = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ['$usageCount', '$maxUses'] }
    };

    if (type && ['specific', 'general'].includes(type)) {
      query.type = type;
    }

    const coupons = await Coupon.find(query)
      .populate('assignedUsers', 'name email')
      .populate('usedBy.user', 'name email')
      .sort({ createdAt: -1 });

    const availableCoupons = coupons.filter(coupon => {
      if (coupon.type === 'specific') {
        const isAssigned = coupon.assignedUsers.some(user => 
          user._id.toString() === userId.toString()
        );
        if (!isAssigned) return false;
      }

      const hasUsed = coupon.usedBy.some(usage => 
        usage.user._id.toString() === userId.toString()
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

const getRedeemedCoupons = async (req, res) => {
  try {
    const userId = req.user.id;

    const redeemedCoupons = await Coupon.find({
      'usedBy.user': userId
    })
    .populate('assignedUsers', 'name email')
    .populate('usedBy.user', 'name email')
    .sort({ updatedAt: -1 });

    const redemptionHistory = redeemedCoupons.map(coupon => {
      const userUsage = coupon.usedBy.find(usage => 
        usage.user._id.toString() === userId.toString()
      );
      
      return {
        coupon: {
          id: coupon._id,
          name: coupon.couponName,
          type: coupon.type,
          expiryDate: coupon.expiryDate,
          usageCount: coupon.usageCount,
          maxUses: coupon.maxUses,
          isActive: coupon.isActive
        },
        redeemedAt: userUsage ? userUsage.usedAt : coupon.updatedAt
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

const getUserCouponStats = async (req, res) => {
  try {
    const userId = req.user.id;

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

    const totalRedeemed = await Coupon.countDocuments({
      usedBy: userId
    });

    const expiredAssigned = await Coupon.countDocuments({
      assignedUsers: userId,
      $or: [
        { expiryDate: { $lte: new Date() } },
        { isActive: false }
      ]
    });

    res.json({
      message: 'User coupon statistics retrieved successfully',
      stats: {
        totalAvailable,
        totalRedeemed,
        expiredAssigned,
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
