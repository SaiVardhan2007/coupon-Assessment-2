const mongoose = require('mongoose');
const User = require('./models/user.model');
const Coupon = require('./models/coupon.model');
require('dotenv').config();

const testModels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coupon_assessment', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Test User Model
    console.log('\n🧪 Testing User Model...');
    
    // Create a test user
    const testUser = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+1234567890',
      currentStudies: '12',
      city: 'New York',
      state: 'NY'
    });

    const savedUser = await testUser.save();
    console.log('✅ User created:', {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      currentStudies: savedUser.currentStudies,
      hashedPassword: savedUser.password ? 'Password hashed' : 'No password'
    });

    // Test password comparison
    const isPasswordValid = await savedUser.comparePassword('password123');
    console.log('✅ Password validation:', isPasswordValid ? 'Success' : 'Failed');

    // Test Coupon Model
    console.log('\n🎫 Testing Coupon Model...');
    
    // Create a test coupon
    const testCoupon = new Coupon({
      couponName: 'STUDENT_DISCOUNT_50',
      type: 'general',
      maxUses: 100,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: 'Special discount for students',
      discountValue: 50,
      discountType: 'percentage',
      createdBy: savedUser._id
    });

    const savedCoupon = await testCoupon.save();
    console.log('✅ Coupon created:', {
      id: savedCoupon._id,
      name: savedCoupon.couponName,
      type: savedCoupon.type,
      maxUses: savedCoupon.maxUses,
      usageCount: savedCoupon.usageCount,
      isAvailable: savedCoupon.isAvailable,
      remainingUses: savedCoupon.remainingUses
    });

    // Test coupon usage
    console.log('\n🎯 Testing Coupon Usage...');
    
    const canUse = savedCoupon.canUserUseCoupon(savedUser._id);
    console.log('✅ Can user use coupon:', canUse);

    if (canUse.canUse) {
      await savedCoupon.useCoupon(savedUser._id);
      console.log('✅ Coupon used successfully');
      console.log('📊 Updated usage count:', savedCoupon.usageCount);
      console.log('📊 Remaining uses:', savedCoupon.remainingUses);
    }

    // Test specific coupon
    console.log('\n🎯 Testing Specific Coupon...');
    
    const specificCoupon = new Coupon({
      couponName: 'VIP_STUDENT_DISCOUNT',
      type: 'specific',
      assignedUsers: [savedUser._id],
      maxUses: 10,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      description: 'VIP discount for selected students',
      discountValue: 75,
      discountType: 'percentage',
      createdBy: savedUser._id
    });

    const savedSpecificCoupon = await specificCoupon.save();
    console.log('✅ Specific coupon created:', {
      name: savedSpecificCoupon.couponName,
      type: savedSpecificCoupon.type,
      assignedUsers: savedSpecificCoupon.assignedUsers.length
    });

    // Test query methods
    console.log('\n📋 Testing Query Methods...');
    
    const activeUsers = await User.findActiveUsers();
    console.log('✅ Active users found:', activeUsers.length);

    const availableCoupons = await Coupon.findAvailableForUser(savedUser._id);
    console.log('✅ Available coupons for user:', availableCoupons.length);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.findByIdAndDelete(savedUser._id);
    await Coupon.findByIdAndDelete(savedCoupon._id);
    await Coupon.findByIdAndDelete(savedSpecificCoupon._id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All model tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the tests
testModels();
