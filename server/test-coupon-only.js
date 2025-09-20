const axios = require('axios');

async function testCouponRedemptionOnly() {
  try {
    console.log('🧪 Testing coupon redemption specifically...\n');
    
    // Step 1: Login to get token (since you said login works)
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('📋 User ID from token:', userId);
    console.log('📋 User role:', loginResponse.data.data.user.role);
    
    // Step 2: Check if TEST_COUPON exists, create if not
    console.log('\n2. Checking if TEST_COUPON exists...');
    
    // First try to redeem TEST_COUPON
    console.log('\n3. Attempting coupon redemption...');
    try {
      const redeemResponse = await axios.post('http://localhost:5020/api/user/coupons/redeem', {
        couponName: 'TEST_COUPON'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ SUCCESS! Coupon redemption worked!');
      console.log('📋 Response:', redeemResponse.data);
      
    } catch (redeemError) {
      console.error('❌ Coupon redemption failed with status:', redeemError.response?.status);
      console.error('❌ Error message:', redeemError.response?.data?.message);
      console.error('❌ Full error data:', redeemError.response?.data);
      
      // Check if it's a 404 (coupon not found)
      if (redeemError.response?.status === 404) {
        console.log('\n💡 Coupon not found. Let me try with any existing coupon...');
        
        // Try to get available coupons first
        try {
          const availableCoupons = await axios.get('http://localhost:5020/api/user/coupons/available', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log('📋 Available coupons:', availableCoupons.data);
          
        } catch (availableError) {
          console.error('❌ Could not fetch available coupons:', availableError.response?.data);
        }
      }
      
      // Check if it's a 500 error (server error)
      if (redeemError.response?.status === 500) {
        console.log('\n🔍 This is the 500 error you mentioned. The issue is in the server code.');
        console.log('🔍 The error details should be in your server console logs.');
        console.log('🔍 Check your terminal where you ran "npm run dev" for the actual error.');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCouponRedemptionOnly();
