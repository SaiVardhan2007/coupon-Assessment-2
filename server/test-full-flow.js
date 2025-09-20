const axios = require('axios');

async function testFullFlow() {
  try {
    console.log('🧪 Testing complete coupon redemption flow...\n');
    
    // Step 1: Check server
    console.log('1. Checking server status...');
    try {
      const healthResponse = await axios.get('http://localhost:5020/');
      console.log('✅ Server is running:', healthResponse.data.message);
    } catch (error) {
      console.error('❌ Server is not running. Please start it with: npm run dev');
      return;
    }
    
    // Step 2: Test admin login
    console.log('\n2. Testing admin login...');
    let token;
    try {
      const loginResponse = await axios.post('http://localhost:5020/api/auth/login', {
        email: 'admin@couponassessment.com',
        password: 'Admin@123'
      });
      
      console.log('✅ Admin login successful');
      token = loginResponse.data.data.token;
      console.log('📋 User info:', {
        id: loginResponse.data.data.user.id,
        name: loginResponse.data.data.user.name,
        email: loginResponse.data.data.user.email,
        role: loginResponse.data.data.user.role
      });
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data || error.message);
      return;
    }
    
    // Step 3: Test coupon redemption
    console.log('\n3. Testing coupon redemption...');
    try {
      const redeemResponse = await axios.post('http://localhost:5020/api/user/coupons/redeem', {
        couponName: 'TEST_COUPON'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Coupon redemption successful!');
      console.log('📋 Redemption details:', redeemResponse.data);
      
    } catch (error) {
      console.error('❌ Coupon redemption failed:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      // If coupon not found, that's also useful information
      if (error.response?.status === 404) {
        console.log('\n💡 Tip: The TEST_COUPON might not exist. Run: node create-test-coupon.js');
      }
    }
    
    // Step 4: Test with a user account (create one if needed)
    console.log('\n4. Testing user registration and coupon redemption...');
    
    const testUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'TestPass123!',
      phone: '+1234567890',
      currentStudies: '12',
      city: 'Test City',
      state: 'Test State'
    };
    
    try {
      // Try to register
      await axios.post('http://localhost:5020/api/auth/signup', testUser);
      console.log('✅ Test user created');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Test user already exists');
      } else {
        console.error('❌ Failed to create test user:', error.response?.data);
      }
    }
    
    // Login as test user
    try {
      const userLoginResponse = await axios.post('http://localhost:5020/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('✅ Test user login successful');
      const userToken = userLoginResponse.data.data.token;
      
      // Try coupon redemption as regular user
      try {
        const userRedeemResponse = await axios.post('http://localhost:5020/api/user/coupons/redeem', {
          couponName: 'TEST_COUPON'
        }, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ User coupon redemption successful!');
        
      } catch (redeemError) {
        if (redeemError.response?.status === 400 && redeemError.response?.data?.message?.includes('already used')) {
          console.log('ℹ️ User has already used this coupon (expected if run multiple times)');
        } else {
          console.error('❌ User coupon redemption failed:', redeemError.response?.data);
        }
      }
      
    } catch (userLoginError) {
      console.error('❌ Test user login failed:', userLoginError.response?.data);
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testFullFlow();
