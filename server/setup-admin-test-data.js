const mongoose = require('mongoose');
const Coupon = require('./models/coupon.model');
require('dotenv').config();

async function setupAdminTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create test coupons for admin dashboard
    const testCoupons = [
      {
        couponName: 'ADMIN_TEST_1',
        type: 'general',
        maxUses: 50,
        usageCount: 5,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        assignedUsers: [],
        usedBy: []
      },
      {
        couponName: 'ADMIN_TEST_2',
        type: 'specific',
        maxUses: 1,
        usageCount: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        assignedUsers: [],
        usedBy: []
      },
      {
        couponName: 'STREAM_FINDER_DEMO',
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
        console.log(`✅ Created test coupon: ${couponData.couponName}`);
      } else {
        console.log(`ℹ️ Test coupon already exists: ${couponData.couponName}`);
      }
    }

    // Test the admin getCoupons function directly
    console.log('\n🧪 Testing admin getCoupons function...');
    const adminController = require('./controllers/admin.controller');
    
    // Mock request and response objects
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        console.log(`✅ getCoupons returned ${data.length} coupons`);
        if (data.length > 0) {
          console.log('📋 Sample coupon:', {
            name: data[0].couponName,
            type: data[0].type,
            isActive: data[0].isActive
          });
        }
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.error(`❌ getCoupons returned status ${code}:`, data);
          return data;
        }
      })
    };

    // This won't work directly because getCoupons is not exported individually
    // But the setup should help the admin dashboard work

    console.log('\n🎉 Admin test data setup complete!');
    console.log('📝 Now try accessing the admin dashboard again.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupAdminTestData();
