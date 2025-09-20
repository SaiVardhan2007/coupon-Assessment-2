const mongoose = require('mongoose');
require('dotenv').config();

async function quickDatabaseTest() {
  try {
    console.log('🔗 Testing database connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    
    // Test collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test if User and Coupon models work
    const User = require('./models/user.model');
    const Coupon = require('./models/coupon.model');
    
    const userCount = await User.countDocuments();
    const couponCount = await Coupon.countDocuments();
    
    console.log(`👥 Users in database: ${userCount}`);
    console.log(`🎫 Coupons in database: ${couponCount}`);
    
    // If no coupons, create one
    if (couponCount === 0) {
      console.log('📝 Creating test coupon...');
      const testCoupon = new Coupon({
        couponName: 'TEST_COUPON',
        type: 'general',
        maxUses: 100,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        assignedUsers: [],
        usedBy: []
      });
      
      await testCoupon.save();
      console.log('✅ Test coupon created');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}

quickDatabaseTest();
