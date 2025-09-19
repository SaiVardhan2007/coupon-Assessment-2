const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: [true, 'Coupon name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Coupon type is required'],
    enum: {
      values: ['specific', 'general'],
      message: 'Coupon type must be either specific or general'
    }
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    _id: false // Prevent automatic _id generation for subdocuments
  }],
  maxUses: {
    type: Number,
    required: [true, 'Maximum uses is required'],
    min: [1, 'Maximum uses must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  discountValue: {
    type: Number,
    min: [0, 'Discount value cannot be negative']
  },
  discountType: {
    type: String,
    enum: {
      values: ['percentage', 'fixed'],
      message: 'Discount type must be either percentage or fixed'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
couponSchema.index({ couponName: 1 });
couponSchema.index({ type: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ 'assignedUsers': 1 });

// Virtual field to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual field to check if coupon is available for use
couponSchema.virtual('isAvailable').get(function() {
  return this.isActive && !this.isExpired && this.usageCount < this.maxUses;
});

// Virtual field to get remaining uses
couponSchema.virtual('remainingUses').get(function() {
  return Math.max(0, this.maxUses - this.usageCount);
});

// Pre-save hook to validate usage count doesn't exceed max uses
couponSchema.pre('save', function(next) {
  if (this.usageCount > this.maxUses) {
    const error = new Error('Usage count cannot exceed maximum uses');
    return next(error);
  }
  next();
});

// Instance method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
  // Check if coupon is available
  if (!this.isAvailable) {
    return { canUse: false, reason: 'Coupon is not available' };
  }

  // For specific coupons, check if user is in assignedUsers
  if (this.type === 'specific') {
    const isAssigned = this.assignedUsers.some(assignedUser => 
      assignedUser.toString() === userId.toString()
    );
    if (!isAssigned) {
      return { canUse: false, reason: 'User is not assigned to this coupon' };
    }
  }

  // Check if user has already used this coupon
  const hasUsed = this.usedBy.some(usage => 
    usage.user.toString() === userId.toString()
  );
  if (hasUsed) {
    return { canUse: false, reason: 'User has already used this coupon' };
  }

  return { canUse: true, reason: 'Coupon can be used' };
};

// Instance method to use coupon by a user
couponSchema.methods.useCoupon = function(userId) {
  const canUseResult = this.canUserUseCoupon(userId);
  
  if (!canUseResult.canUse) {
    throw new Error(canUseResult.reason);
  }

  // Add to usedBy array and increment usage count
  this.usedBy.push({
    user: userId,
    usedAt: new Date()
  });
  this.usageCount += 1;

  return this.save();
};

// Static method to find available coupons for a user
couponSchema.statics.findAvailableForUser = function(userId, couponType = null) {
  const query = {
    isActive: true,
    expiryDate: { $gt: new Date() },
    $expr: { $lt: ['$usageCount', '$maxUses'] }
  };

  if (couponType) {
    query.type = couponType;
  }

  return this.find(query).populate('assignedUsers', 'name email');
};

// Static method to find expired coupons
couponSchema.statics.findExpired = function() {
  return this.find({
    $or: [
      { expiryDate: { $lte: new Date() } },
      { $expr: { $gte: ['$usageCount', '$maxUses'] } }
    ]
  });
};

// Transform output (include virtuals)
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
