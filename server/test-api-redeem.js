const axios = require('axios');

async function testCouponRedemption() {
  try {
    // First, test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Admin login successful');
    const token = loginResponse.data.data.token;
    
    // Test the coupon redemption endpoint
    console.log('2. Testing coupon redemption...');
    try {
      const redeemResponse = await axios.post('http://localhost:5020/api/user/coupons/redeem', {
        couponName: 'TEST_COUPON'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Coupon redemption successful:', redeemResponse.data);
    } catch (redeemError) {
      console.error('❌ Coupon redemption failed:', {
        status: redeemError.response?.status,
        data: redeemError.response?.data,
        message: redeemError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5020/');
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start it first.');
    return false;
  }
}

async function main() {
  console.log('🧪 Testing coupon redemption API...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) return;
  
  await testCouponRedemption();
}

main();
