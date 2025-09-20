const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');
const { sendCouponEmail } = require('../utils/emailService');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    // Add user statistics
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        // Count user's coupons
        const totalCoupons = await Coupon.countDocuments({
          assignedUsers: user._id
        });
        
        const activeCoupons = await Coupon.countDocuments({
          assignedUsers: user._id,
          isActive: true,
          expiryDate: { $gte: new Date() }
        });
        
        const expiredCoupons = await Coupon.countDocuments({
          assignedUsers: user._id,
          expiryDate: { $lt: new Date() }
        });
        
        return {
          ...userObj,
          stats: {
            totalCoupons,
            activeCoupons,
            expiredCoupons,
            usedCoupons: totalCoupons - activeCoupons
          }
        };
      })
    );
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's coupon history
    const userCoupons = await Coupon.find({
      assignedUsers: user._id
    }).sort({ updatedAt: -1 });
    
    const userObj = user.toObject();
    userObj.coupons = userCoupons;
    
    res.json(userObj);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email already exists (excluding current user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(user._id, { password: 0 });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    // Get new users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    // Get user registration trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userTrend = await User.aggregate([
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
    
    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      regularUsers,
      newUsersThisMonth,
      userTrend
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get coupon statistics (admin only)
const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments({});
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      expiryDate: { $gte: new Date() }
    });
    const expiredCoupons = await Coupon.countDocuments({
      expiryDate: { $lt: new Date() }
    });
    const totalUsage = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);
    
    // Get coupon usage trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usageTrend = await Coupon.aggregate([
      {
        $match: {
          updatedAt: { $gte: thirtyDaysAgo },
          usageCount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          usage: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get top performing coupons
    const topCoupons = await Coupon.find({ usageCount: { $gt: 0 } })
      .sort({ usageCount: -1 })
      .limit(5)
      .select('title code usageCount usageLimit discountValue discountType');
    
    res.json({
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      inactiveCoupons: totalCoupons - activeCoupons - expiredCoupons,
      totalUsage: totalUsage[0]?.total || 0,
      usageTrend,
      topCoupons
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new coupon (admin only)
const createCoupon = async (req, res) => {
  try {
    const {
      couponName,
      type,
      assignedUsers,
      maxUses,
      expiryDate
    } = req.body;

    // Validate required fields
    if (!couponName || !type || !expiryDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: couponName, type, and expiryDate are required' 
      });
    }

    // Check if coupon name already exists
    const existingCoupon = await Coupon.findOne({ 
      couponName: couponName.trim() 
    });
    if (existingCoupon) {
      return res.status(400).json({ 
        message: 'Coupon name already exists' 
      });
    }

    // Validate expiry date is in the future
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ 
        message: 'Expiry date must be in the future' 
      });
    }

    // Prepare coupon data
    let couponData = {
      couponName: couponName.trim(),
      type,
      expiryDate: new Date(expiryDate)
    };

    if (type === 'specific') {
      // For specific coupons, assignedUsers array is required
      if (!assignedUsers || !Array.isArray(assignedUsers) || assignedUsers.length === 0) {
        return res.status(400).json({ 
          message: 'assignedUsers array is required for specific coupons' 
        });
      }

      // Validate that all assigned users exist
      const users = await User.find({ _id: { $in: assignedUsers } });
      if (users.length !== assignedUsers.length) {
        return res.status(400).json({ 
          message: 'One or more assigned users do not exist' 
        });
      }

      couponData.assignedUsers = assignedUsers;
      couponData.maxUses = assignedUsers.length; // For specific coupons, maxUses equals number of assigned users
      
    } else if (type === 'general') {
      // For general coupons, maxUses is required
      if (!maxUses || maxUses < 1) {
        return res.status(400).json({ 
          message: 'maxUses is required for general coupons and must be at least 1' 
        });
      }

      couponData.maxUses = maxUses;
      couponData.assignedUsers = []; // General coupons have no assigned users
      
    } else {
      return res.status(400).json({ 
        message: 'Invalid coupon type. Must be either "specific" or "general"' 
      });
    }

    // Create the coupon
    const coupon = new Coupon(couponData);
    await coupon.save();

    // Populate the created coupon with user details for response
    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('assignedUsers', 'name email');

    // Send assignment emails for specific coupons
    if (type === 'specific' && populatedCoupon.assignedUsers.length > 0) {
      console.log(`📧 Sending coupon assignment emails to ${populatedCoupon.assignedUsers.length} users...`);
      
      // Send emails to all assigned users (don't await to avoid blocking the response)
      const emailPromises = populatedCoupon.assignedUsers.map(async (user) => {
        try {
          console.log(`📤 Attempting to send email to ${user.email}...`);
          const emailResult = await sendCouponEmail(
            user.email,
            user.name,
            {
              couponName: populatedCoupon.couponName,
              type: populatedCoupon.type,
              expiryDate: populatedCoupon.expiryDate,
              maxUses: populatedCoupon.maxUses,
              usageCount: populatedCoupon.usageCount,
              isActive: populatedCoupon.isActive
            },
            'assignment'
          );
          
          if (emailResult && emailResult.success) {
            console.log(`✅ Assignment email sent successfully to ${user.email}`, {
              messageId: emailResult.messageId
            });
          } else {
            console.error(`❌ Failed to send assignment email to ${user.email}:`, emailResult?.error || 'Unknown error');
          }
          
          return emailResult;
        } catch (error) {
          console.error(`❌ Exception sending assignment email to ${user.email}:`, {
            message: error.message,
            stack: error.stack?.split('\n')[0]
          });
          return { success: false, error: error.message, recipient: user.email };
        }
      });

      // Process emails in the background
      Promise.all(emailPromises)
        .then((results) => {
          const successful = results.filter(r => r.success).length;
          const failed = results.filter(r => !r.success).length;
          console.log(`📊 Coupon assignment email summary: ${successful} successful, ${failed} failed`);
        })
        .catch((error) => {
          console.error('❌ Error in bulk email sending:', error);
        });
    }

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon: populatedCoupon
    });

  } catch (error) {
    console.error('Error creating coupon:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid data format provided' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating coupon' 
    });
  }
};

// Get all coupons (admin only)
const getCoupons = async (req, res) => {
  try {
    console.log('📋 Admin getCoupons: Fetching all coupons...');
    
    // First try to get coupons without populate to avoid structure issues
    let coupons;
    try {
      coupons = await Coupon.find({}).sort({ createdAt: -1 });
      console.log(`📊 Found ${coupons.length} raw coupons`);
      
      // Now try to populate safely
      const populatedCoupons = await Coupon.find({})
        .populate('assignedUsers', 'name email')
        .sort({ createdAt: -1 });
      
      // Try to populate usedBy.user if the structure is correct
      const fullyPopulatedCoupons = [];
      for (const coupon of populatedCoupons) {
        try {
          const populatedCoupon = await Coupon.findById(coupon._id)
            .populate('assignedUsers', 'name email')
            .populate('usedBy.user', 'name email');
          fullyPopulatedCoupons.push(populatedCoupon);
        } catch (populateError) {
          console.warn(`⚠️ Could not populate usedBy for coupon ${coupon.couponName}:`, populateError.message);
          // Use the basic populated version
          fullyPopulatedCoupons.push(coupon);
        }
      }
      
      coupons = fullyPopulatedCoupons;
      
    } catch (populateError) {
      console.warn('⚠️ Populate failed, using raw coupons:', populateError.message);
      coupons = await Coupon.find({}).sort({ createdAt: -1 });
    }

    // Check for coupons that should be automatically deactivated
    const updatedCoupons = [];
    for (const coupon of coupons) {
      let shouldUpdate = false;
      
      // Auto-deactivate general coupons that have reached max usage
      if (coupon.type === 'general' && 
          coupon.isActive && 
          coupon.usageCount >= coupon.maxUses) {
        coupon.isActive = false;
        shouldUpdate = true;
      }
      
      // Auto-deactivate expired coupons
      if (coupon.isActive && new Date() > coupon.expiryDate) {
        coupon.isActive = false;
        shouldUpdate = true;
      }
      
      if (shouldUpdate) {
        try {
          await coupon.save();
          console.log(`🔄 Updated coupon: ${coupon.couponName}`);
        } catch (saveError) {
          console.warn(`⚠️ Could not save coupon ${coupon.couponName}:`, saveError.message);
        }
      }
      
      updatedCoupons.push(coupon);
    }

    console.log('✅ Admin getCoupons: Sending response');
    res.json(updatedCoupons);
  } catch (error) {
    console.error('❌ Error fetching coupons:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get coupon details by ID (admin only)
const getCouponDetails = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('assignedUsers', 'name email phone currentStudies city state')
      .populate('usedBy.user', 'name email phone');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon details:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid coupon ID format' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle coupon active status (admin only)
const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Toggle the isActive status
    coupon.isActive = !coupon.isActive;
    await coupon.save();

    // Return the updated coupon with populated fields
    const updatedCoupon = await Coupon.findById(coupon._id)
      .populate('assignedUsers', 'name email');

    res.json({
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon: updatedCoupon
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid coupon ID format' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
