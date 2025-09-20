const mongoose = require('mongoose');
const Coupon = require('./models/coupon.model');
const User = require('./models/user.model');
require('dotenv').config();

async function testCouponRedemption() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if there are any coupons
    const coupons = await Coupon.find({});
    console.log(`📊 Found ${coupons.length} coupons in database`);
    
    if (coupons.length === 0) {
      console.log('📝 Creating a test coupon...');
      
      // Create a test coupon
      const testCoupon = new Coupon({
        couponName: 'TEST_COUPON_' + Date.now(),
        type: 'general',
        maxUses: 10,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        usedBy: []
      });
      
      await testCoupon.save();
      console.log('✅ Test coupon created:', testCoupon.couponName);
    }

    // Get a coupon to test with
    const testCoupon = await Coupon.findOne({ isActive: true });
    if (!testCoupon) {
      console.log('❌ No active coupons found');
      return;
    }

    console.log('🎫 Testing with coupon:', testCoupon.couponName);
    console.log('📋 Current coupon state:', {
      type: testCoupon.type,
      usageCount: testCoupon.usageCount,
      maxUses: testCoupon.maxUses,
      usedBy: testCoupon.usedBy,
      isActive: testCoupon.isActive
    });

    // Check if there are any users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const testUser = users[0];
    console.log('👤 Testing with user:', testUser.email);

    // Simulate the redemption logic
    console.log('🔄 Simulating coupon redemption...');

    // Check if user has already used this coupon
    const hasUserUsedCoupon = testCoupon.usedBy.some(usage => {
      if (usage.user) {
        return usage.user.toString() === testUser._id.toString();
      }
      // Old format compatibility
      return usage.toString() === testUser._id.toString();
    });

    if (hasUserUsedCoupon) {
      console.log('⚠️ User has already used this coupon');
    } else {
      console.log('✅ User can use this coupon');

      // Try to redeem the coupon
      testCoupon.usedBy.push({
        user: testUser._id,
        usedAt: new Date()
      });
      testCoupon.usageCount += 1;

      await testCoupon.save();
      console.log('🎉 Coupon redeemed successfully!');
      
      // Check the updated state
      const updatedCoupon = await Coupon.findById(testCoupon._id);
      console.log('📋 Updated coupon state:', {
        usageCount: updatedCoupon.usageCount,
        usedByLength: updatedCoupon.usedBy.length,
        lastUsage: updatedCoupon.usedBy[updatedCoupon.usedBy.length - 1]
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}

testCouponRedemption();
