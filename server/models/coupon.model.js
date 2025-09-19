const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: [true, 'Coupon name is required'],
    unique: true,
    trim: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxUses: {
    type: Number
  },
  usageCount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
couponSchema.index({ couponName: 1 });
couponSchema.index({ type: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ assignedUsers: 1 });

// Virtual field to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual field to check if coupon is available for use
couponSchema.virtual('isAvailable').get(function() {
  return this.isActive && !this.isExpired && this.usageCount < this.maxUses;
});

// Ensure virtual fields are serialized
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Coupon', couponSchema);
