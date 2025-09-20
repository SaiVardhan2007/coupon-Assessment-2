const mongoose = require('mongoose');
const Coupon = require('./models/coupon.model');
require('dotenv').config();

async function debugCouponsIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Get raw coupons without populate
    console.log('\n1. Testing raw coupon fetch...');
    const rawCoupons = await Coupon.find({}).limit(5);
    console.log(`📊 Found ${rawCoupons.length} coupons`);
    
    if (rawCoupons.length > 0) {
      console.log('📋 Sample coupon structure:');
      console.log(JSON.stringify(rawCoupons[0], null, 2));
    }

    // Test 2: Check usedBy field structure
    console.log('\n2. Checking usedBy field structure...');
    for (let i = 0; i < Math.min(rawCoupons.length, 3); i++) {
      const coupon = rawCoupons[i];
      console.log(`\nCoupon: ${coupon.couponName}`);
      console.log(`usedBy type: ${Array.isArray(coupon.usedBy) ? 'Array' : typeof coupon.usedBy}`);
      console.log(`usedBy length: ${coupon.usedBy?.length || 0}`);
      
      if (coupon.usedBy && coupon.usedBy.length > 0) {
        console.log('usedBy sample:', coupon.usedBy[0]);
        console.log('usedBy has user field:', !!coupon.usedBy[0]?.user);
        console.log('usedBy has usedAt field:', !!coupon.usedBy[0]?.usedAt);
      }
    }

    // Test 3: Try populate with error handling
    console.log('\n3. Testing populate...');
    try {
      const populatedCoupons = await Coupon.find({})
        .populate('assignedUsers', 'name email')
        .populate('usedBy.user', 'name email')
        .limit(2);
      
      console.log('✅ Populate successful!');
      console.log(`📊 Populated ${populatedCoupons.length} coupons`);
      
    } catch (populateError) {
      console.error('❌ Populate failed:', populateError.message);
      
      // Try without usedBy populate
      console.log('🔄 Trying without usedBy populate...');
      const simplePopulated = await Coupon.find({})
        .populate('assignedUsers', 'name email')
        .limit(2);
      
      console.log('✅ Simple populate successful!');
      console.log(`📊 Simple populated ${simplePopulated.length} coupons`);
    }

    // Test 4: Create a test coupon with correct structure
    console.log('\n4. Creating test coupon...');
    const testCoupon = new Coupon({
      couponName: 'DEBUG_TEST_COUPON',
      type: 'general',
      maxUses: 10,
      usageCount: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      assignedUsers: [],
      usedBy: []
    });
    
    await testCoupon.save();
    console.log('✅ Test coupon created');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected');
  }
}

debugCouponsIssue();
