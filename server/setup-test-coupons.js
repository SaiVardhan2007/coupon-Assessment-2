const mongoose = require('mongoose');
const Coupon = require('./models/coupon.model');
require('dotenv').config();

async function createTestCoupons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create test coupons
    const testCoupons = [
      {
        couponName: 'STREAM_FINDER',
        type: 'general',
        maxUses: 100,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        assignedUsers: [],
        usedBy: []
      },
      {
        couponName: 'CAREER_GUIDE',
        type: 'general',
        maxUses: 100,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        assignedUsers: [],
        usedBy: []
      },
      {
        couponName: 'SKILL_ASSESSMENT',
        type: 'general',
        maxUses: 100,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        assignedUsers: [],
        usedBy: []
      },
      {
        couponName: 'TEST123',
        type: 'general',
        maxUses: 100,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        assignedUsers: [],
        usedBy: []
      }
    ];

    for (const couponData of testCoupons) {
      const existingCoupon = await Coupon.findOne({ couponName: couponData.couponName });
      
      if (!existingCoupon) {
        const coupon = new Coupon(couponData);
        await coupon.save();
        console.log(`✅ Created coupon: ${couponData.couponName}`);
      } else {
        console.log(`ℹ️ Coupon already exists: ${couponData.couponName}`);
      }
    }

    console.log('\n🎉 Test coupons setup complete!');
    console.log('You can now use these coupons:');
    console.log('- STREAM_FINDER');
    console.log('- CAREER_GUIDE');
    console.log('- SKILL_ASSESSMENT');
    console.log('- TEST123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestCoupons();
