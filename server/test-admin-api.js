const axios = require('axios');

async function testAdminCouponsAPI() {
  try {
    console.log('🧪 Testing Admin Coupons API...\n');
    
    // Step 1: Login as admin
    console.log('1. Admin login...');
    const loginResponse = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Admin login successful');
    const token = loginResponse.data.data.token;
    const userRole = loginResponse.data.data.user.role;
    console.log('📋 User role:', userRole);

    // Step 2: Test admin coupons endpoint
    console.log('\n2. Fetching coupons via admin API...');
    try {
      const couponsResponse = await axios.get('http://localhost:5020/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Admin coupons API successful!');
      console.log(`📊 Found ${couponsResponse.data.length} coupons`);
      
      if (couponsResponse.data.length > 0) {
        console.log('📋 Sample coupon:', {
          name: couponsResponse.data[0].couponName,
          type: couponsResponse.data[0].type,
          isActive: couponsResponse.data[0].isActive,
          usageCount: couponsResponse.data[0].usageCount,
          maxUses: couponsResponse.data[0].maxUses
        });
      }
      
    } catch (apiError) {
      console.error('❌ Admin coupons API failed:');
      console.error('Status:', apiError.response?.status);
      console.error('Data:', apiError.response?.data);
      console.error('Message:', apiError.message);
      
      // Check if it's an auth issue
      if (apiError.response?.status === 403) {
        console.log('\n💡 This might be an authorization issue.');
        console.log('🔍 Check if the user has admin role and admin middleware is working.');
      }
      
      if (apiError.response?.status === 500) {
        console.log('\n💡 This is a server error.');
        console.log('🔍 Check your server console logs for the actual error details.');
      }
    }

    // Step 3: Test other admin endpoints
    console.log('\n3. Testing other admin endpoints...');
    
    try {
      const usersResponse = await axios.get('http://localhost:5020/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`✅ Admin users API works (${usersResponse.data.length} users)`);
    } catch (usersError) {
      console.error('❌ Admin users API failed:', usersError.response?.status);
    }

    try {
      const statsResponse = await axios.get('http://localhost:5020/api/admin/coupons/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Admin coupon stats API works');
    } catch (statsError) {
      console.error('❌ Admin coupon stats API failed:', statsError.response?.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminCouponsAPI();
