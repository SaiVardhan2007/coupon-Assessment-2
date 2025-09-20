const axios = require('axios');

// Test admin login
async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'Admin@09'
    });
    
    console.log('✅ Admin login successful:', response.data);
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
  }
  
  // Test with old password to see if that works
  try {
    const response = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'admin123456'
    });
    
    console.log('✅ Admin login with old password successful:', response.data);
  } catch (error) {
    console.error('❌ Admin login with old password failed:', error.response?.data || error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5020/api/health');
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first.');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testLogin();
  }
}

main();
