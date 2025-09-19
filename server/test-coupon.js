const mongoose = require('mongoose');
const User = require('./models/user.model');
const Coupon = require('./models/coupon.model');
const { createCoupon } = require('./controllers/admin.controller');
require('dotenv').config();

// Mock request and response objects
const createMockReq = (body, user) => ({
  body,
  user
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

async function testCreateCoupon() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a sample user for testing
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found in database');
      return;
    }

    // Get some sample users for specific coupon testing
    const users = await User.find({ role: 'user' }).limit(2);
    console.log(`Found ${users.length} users for testing`);

    // Test Case 1: Create a specific coupon
    console.log('\n--- Testing Specific Coupon Creation ---');
    const specificCouponReq = createMockReq({
      couponName: 'Test Specific Coupon',
      type: 'specific',
      assignedUsers: users.map(u => u._id),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: 'Test specific coupon for selected users',
      discountValue: 20,
      discountType: 'percentage'
    }, { id: adminUser._id });

    const specificCouponRes = createMockRes();
    await createCoupon(specificCouponReq, specificCouponRes);
    
    console.log('Status:', specificCouponRes.statusCode);
    console.log('Response:', JSON.stringify(specificCouponRes.data, null, 2));

    // Test Case 2: Create a general coupon
    console.log('\n--- Testing General Coupon Creation ---');
    const generalCouponReq = createMockReq({
      couponName: 'Test General Coupon',
      type: 'general',
      maxUses: 100,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      description: 'Test general coupon for all users',
      discountValue: 15,
      discountType: 'percentage'
    }, { id: adminUser._id });

    const generalCouponRes = createMockRes();
    await createCoupon(generalCouponReq, generalCouponRes);
    
    console.log('Status:', generalCouponRes.statusCode);
    console.log('Response:', JSON.stringify(generalCouponRes.data, null, 2));

    // Test Case 3: Test validation error (missing required fields)
    console.log('\n--- Testing Validation Error ---');
    const invalidReq = createMockReq({
      couponName: 'Invalid Coupon'
      // Missing type and expiryDate
    }, { id: adminUser._id });

    const invalidRes = createMockRes();
    await createCoupon(invalidReq, invalidRes);
    
    console.log('Status:', invalidRes.statusCode);
    console.log('Response:', JSON.stringify(invalidRes.data, null, 2));

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testCreateCoupon();
