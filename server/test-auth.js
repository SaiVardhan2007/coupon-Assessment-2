const axios = require('axios');

const API_BASE_URL = 'http://localhost:5020/api';

// Test function
async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Check server status
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get('http://localhost:5020/');
    console.log('✅ Server is running:', healthCheck.data.message);
    console.log();

    // Test 2: Admin login
    console.log('2. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@couponassessment.com',
      password: 'Admin@123'
    });
    console.log('✅ Admin login successful');
    console.log('📝 Response:', JSON.stringify(loginResponse.data, null, 2));
    console.log();

    const token = loginResponse.data.data.token;

    // Test 3: Access protected route
    console.log('3. Testing protected route with valid token...');
    const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected route access successful');
    console.log('📝 Profile data:', JSON.stringify(profileResponse.data, null, 2));
    console.log();

    // Test 4: Test admin-only route
    console.log('4. Testing admin-only route...');
    const adminResponse = await axios.get(`${API_BASE_URL}/users/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Admin route access successful');
    console.log('📝 Admin data:', JSON.stringify(adminResponse.data, null, 2));
    console.log();

    // Test 5: Test signup with complete user data
    console.log('5. Testing user signup with complete data...');
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
      name: 'Test Student',
      email: 'teststudent@example.com',
      password: 'password123',
      phone: '+1234567890',
      currentStudies: '11',
      city: 'Mumbai',
      state: 'Maharashtra'
    });
    console.log('✅ User signup successful');
    console.log('📝 Signup response:', JSON.stringify(signupResponse.data, null, 2));
    console.log();

    // Test 6: Test login with the newly created user
    console.log('6. Testing login with newly created user...');
    const userLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'teststudent@example.com',
      password: 'password123'
    });
    console.log('✅ User login successful');
    console.log('📝 User login response:', JSON.stringify(userLoginResponse.data, null, 2));
    console.log();

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

// Run the tests
testAuthEndpoints();
