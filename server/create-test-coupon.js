const mongoose = require('mongoose');
const Coupon = require('./models/coupon.model');
require('dotenv').config();

async function createTestCoupon() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if TEST_COUPON already exists
    const existingCoupon = await Coupon.findOne({ couponName: 'TEST_COUPON' });
    if (existingCoupon) {
      console.log('✅ TEST_COUPON already exists:', {
        name: existingCoupon.couponName,
        type: existingCoupon.type,
        isActive: existingCoupon.isActive,
        usageCount: existingCoupon.usageCount,
        maxUses: existingCoupon.maxUses
      });
    } else {
      // Create a test coupon
      const testCoupon = new Coupon({
        couponName: 'TEST_COUPON',
        type: 'general',
        maxUses: 10,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        assignedUsers: [],
        usedBy: []
      });
      
      await testCoupon.save();
      console.log('✅ TEST_COUPON created successfully:', {
        name: testCoupon.couponName,
        type: testCoupon.type,
        isActive: testCoupon.isActive,
        usageCount: testCoupon.usageCount,
        maxUses: testCoupon.maxUses
      });
    }

    // List all coupons
    const allCoupons = await Coupon.find({});
    console.log(`📊 Total coupons in database: ${allCoupons.length}`);
    allCoupons.forEach(coupon => {
      console.log(`- ${coupon.couponName} (${coupon.type}, active: ${coupon.isActive})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}

createTestCoupon();
