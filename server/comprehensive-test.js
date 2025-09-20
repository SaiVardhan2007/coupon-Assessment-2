const axios = require('axios');

const BASE_URL = 'http://localhost:5020/api';

// Test users data
const testUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@test.com',
    password: 'password123',
    phone: '+1234567890',
    currentStudies: '12',
    city: 'New York',
    state: 'NY'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@test.com',
    password: 'password456',
    phone: '+1987654321',
    currentStudies: '11',
    city: 'Los Angeles',
    state: 'CA'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@test.com',
    password: 'password789',
    phone: '+1122334455',
    currentStudies: '10',
    city: 'Chicago',
    state: 'IL'
  }
];

// Admin credentials
const adminCredentials = {
  email: 'admin@couponassessment.com',
  password: 'admin123456'
};

let userTokens = [];
let adminToken = '';
let createdCoupons = [];

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testUserSignup() {
  console.log('\n🧪 TESTING USER SIGNUP');
  console.log('='.repeat(50));
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n📝 Testing signup for ${user.name}...`);
    
    const result = await apiRequest('POST', '/auth/signup', user);
    
    if (result.success) {
      console.log(`✅ ${user.name} signed up successfully`);
      userTokens[i] = result.data.data.token;
      console.log(`   User ID: ${result.data.data.user.id}`);
      console.log(`   Role: ${result.data.data.user.role}`);
    } else {
      console.log(`❌ ${user.name} signup failed:`, result.error);
      return false;
    }
  }
  
  return true;
}

async function testUserLogin() {
  console.log('\n🔐 TESTING USER LOGIN');
  console.log('='.repeat(50));
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n🔑 Testing login for ${user.name}...`);
    
    const result = await apiRequest('POST', '/auth/login', {
      email: user.email,
      password: user.password
    });
    
    if (result.success) {
      console.log(`✅ ${user.name} logged in successfully`);
      userTokens[i] = result.data.data.token;
    } else {
      console.log(`❌ ${user.name} login failed:`, result.error);
      return false;
    }
  }
  
  return true;
}

async function testAdminLogin() {
  console.log('\n👑 TESTING ADMIN LOGIN');
  console.log('='.repeat(50));
  
  const result = await apiRequest('POST', '/auth/login', adminCredentials);
  
  if (result.success) {
    console.log('✅ Admin logged in successfully');
    adminToken = result.data.data.token;
    console.log(`   Admin role: ${result.data.data.user.role}`);
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
}

async function testTokenVerification() {
  console.log('\n🔍 TESTING TOKEN VERIFICATION');
  console.log('='.repeat(50));
  
  // Test user token verification
  for (let i = 0; i < userTokens.length; i++) {
    if (userTokens[i]) {
      const result = await apiRequest('GET', '/users/verify', null, userTokens[i]);
      if (result.success) {
        console.log(`✅ User ${i + 1} token verified`);
      } else {
        console.log(`❌ User ${i + 1} token verification failed:`, result.error);
      }
    }
  }
  
  // Test admin token verification
  if (adminToken) {
    const result = await apiRequest('GET', '/users/verify', null, adminToken);
    if (result.success) {
      console.log('✅ Admin token verified');
    } else {
      console.log('❌ Admin token verification failed:', result.error);
    }
  }
}

async function testCouponCreation() {
  console.log('\n🎫 TESTING COUPON CREATION (ADMIN)');
  console.log('='.repeat(50));
  
  const testCoupons = [
    {
      title: 'Welcome Bonus',
      description: 'Get 20% off on your first purchase',
      discountType: 'percentage',
      discountValue: 20,
      minimumAmount: 100,
      maxUsage: 100,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    },
    {
      title: 'Student Special',
      description: 'Flat $50 off for students',
      discountType: 'fixed',
      discountValue: 50,
      minimumAmount: 200,
      maxUsage: 50,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    }
  ];
  
  for (const coupon of testCoupons) {
    console.log(`\n🎟️  Creating coupon: ${coupon.title}...`);
    
    const result = await apiRequest('POST', '/admin/coupons', coupon, adminToken);
    
    if (result.success) {
      console.log(`✅ Coupon "${coupon.title}" created successfully`);
      createdCoupons.push(result.data.data.coupon);
      console.log(`   Coupon Code: ${result.data.data.coupon.code}`);
    } else {
      console.log(`❌ Coupon "${coupon.title}" creation failed:`, result.error);
    }
  }
}

async function testCouponListing() {
  console.log('\n📋 TESTING COUPON LISTING');
  console.log('='.repeat(50));
  
  // Test getting available coupons for users
  for (let i = 0; i < userTokens.length; i++) {
    if (userTokens[i]) {
      console.log(`\n📝 Getting available coupons for User ${i + 1}...`);
      
      const result = await apiRequest('GET', '/users/coupons/available', null, userTokens[i]);
      
      if (result.success) {
        console.log(`✅ User ${i + 1} can see ${result.data.data.coupons.length} available coupons`);
        result.data.data.coupons.forEach(coupon => {
          console.log(`   - ${coupon.title} (${coupon.code})`);
        });
      } else {
        console.log(`❌ Failed to get coupons for User ${i + 1}:`, result.error);
      }
    }
  }
}

async function testCouponRedemption() {
  console.log('\n🎁 TESTING COUPON REDEMPTION');
  console.log('='.repeat(50));
  
  if (createdCoupons.length === 0) {
    console.log('❌ No coupons available for redemption testing');
    return;
  }
  
  // Test redeeming coupons with different users
  for (let i = 0; i < Math.min(userTokens.length, createdCoupons.length); i++) {
    if (userTokens[i] && createdCoupons[i]) {
      const coupon = createdCoupons[i];
      console.log(`\n🎫 User ${i + 1} redeeming coupon: ${coupon.title}...`);
      
      const result = await apiRequest('POST', '/users/coupons/redeem', {
        couponCode: coupon.code
      }, userTokens[i]);
      
      if (result.success) {
        console.log(`✅ User ${i + 1} successfully redeemed coupon`);
        console.log(`   Discount: ${result.data.data.redemption.discountAmount}`);
      } else {
        console.log(`❌ User ${i + 1} coupon redemption failed:`, result.error);
      }
    }
  }
}

async function testAssessmentFlow() {
  console.log('\n📚 TESTING ASSESSMENT/EXAM FLOW');
  console.log('='.repeat(50));
  
  // Test getting assessment questions
  console.log('\n📝 Testing assessment question retrieval...');
  
  const result = await apiRequest('GET', '/gemini/assessment-questions', null, userTokens[0]);
  
  if (result.success) {
    console.log('✅ Assessment questions retrieved successfully');
    const questions = result.data.data.questions;
    console.log(`   Number of questions: ${questions.length}`);
    
    // Test submitting assessment answers
    console.log('\n📤 Testing assessment submission...');
    
    const answers = questions.map((q, index) => ({
      questionId: index + 1,
      answer: q.options ? q.options[0] : 'Sample answer',
      question: q.question
    }));
    
    const submitResult = await apiRequest('POST', '/gemini/submit-assessment', {
      answers: answers
    }, userTokens[0]);
    
    if (submitResult.success) {
      console.log('✅ Assessment submitted successfully');
      console.log(`   Score: ${submitResult.data.data.score}%`);
      console.log(`   Grade: ${submitResult.data.data.grade}`);
      console.log(`   Feedback: ${submitResult.data.data.feedback}`);
    } else {
      console.log('❌ Assessment submission failed:', submitResult.error);
    }
  } else {
    console.log('❌ Failed to get assessment questions:', result.error);
  }
}

async function testUserStats() {
  console.log('\n📊 TESTING USER STATISTICS');
  console.log('='.repeat(50));
  
  for (let i = 0; i < userTokens.length; i++) {
    if (userTokens[i]) {
      console.log(`\n📈 Getting stats for User ${i + 1}...`);
      
      const result = await apiRequest('GET', '/users/coupons/stats', null, userTokens[i]);
      
      if (result.success) {
        console.log(`✅ User ${i + 1} stats retrieved`);
        console.log(`   Total redeemed: ${result.data.data.totalRedeemed}`);
        console.log(`   Total savings: $${result.data.data.totalSavings}`);
      } else {
        console.log(`❌ Failed to get stats for User ${i + 1}:`, result.error);
      }
    }
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  TESTING ERROR HANDLING');
  console.log('='.repeat(50));
  
  // Test invalid login
  console.log('\n🔐 Testing invalid login...');
  const invalidLogin = await apiRequest('POST', '/auth/login', {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  });
  
  if (!invalidLogin.success && invalidLogin.status === 401) {
    console.log('✅ Invalid login properly rejected');
  } else {
    console.log('❌ Invalid login should be rejected');
  }
  
  // Test accessing protected route without token
  console.log('\n🔒 Testing protected route without token...');
  const noToken = await apiRequest('GET', '/users/profile');
  
  if (!noToken.success && (noToken.status === 401 || noToken.status === 403)) {
    console.log('✅ Protected route properly requires authentication');
  } else {
    console.log('❌ Protected route should require authentication');
  }
  
  // Test invalid coupon redemption
  console.log('\n🎫 Testing invalid coupon redemption...');
  const invalidCoupon = await apiRequest('POST', '/users/coupons/redeem', {
    couponCode: 'INVALID123'
  }, userTokens[0]);
  
  if (!invalidCoupon.success) {
    console.log('✅ Invalid coupon properly rejected');
  } else {
    console.log('❌ Invalid coupon should be rejected');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE TESTING');
  console.log('='.repeat(60));
  
  try {
    // Test server health
    console.log('\n🏥 Testing server health...');
    const health = await apiRequest('GET', '/../');
    if (health.success) {
      console.log('✅ Server is healthy');
    } else {
      console.log('❌ Server health check failed');
      return;
    }
    
    // Run all tests in sequence
    const testResults = [];
    
    testResults.push(await testUserSignup());
    testResults.push(await testUserLogin());
    testResults.push(await testAdminLogin());
    
    await testTokenVerification();
    await testCouponCreation();
    await testCouponListing();
    await testCouponRedemption();
    await testAssessmentFlow();
    await testUserStats();
    await testErrorHandling();
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passedTests = testResults.filter(result => result === true).length;
    const totalCriticalTests = testResults.length;
    
    console.log(`✅ Critical tests passed: ${passedTests}/${totalCriticalTests}`);
    
    if (passedTests === totalCriticalTests) {
      console.log('🎉 ALL CRITICAL TESTS PASSED! Application is working correctly.');
    } else {
      console.log('⚠️  Some critical tests failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('💥 Test runner crashed:', error);
  }
}

// Run the tests
runAllTests();
