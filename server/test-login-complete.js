const axios = require('axios');

async function createTestUser() {
  try {
    // Create a test user
    const signupResponse = await axios.post('http://localhost:5020/api/auth/signup', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!',
      phone: '+1234567890',
      currentStudies: '12',
      city: 'Test City',
      state: 'Test State'
    });
    
    console.log('✅ User created successfully:', signupResponse.data);
    
    // Try to login with the new user
    const loginResponse = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'test@example.com',
      password: 'TestPass123!'
    });
    
    console.log('✅ User login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testAdminLogin() {
  try {
    const loginResponse = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Admin login successful:', loginResponse.data);
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
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
  console.log('🧪 Testing authentication...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) return;
  
  console.log('\n1. Testing admin login...');
  await testAdminLogin();
  
  console.log('\n2. Testing user creation and login...');
  await createTestUser();
}

main();
