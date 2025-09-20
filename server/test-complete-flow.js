const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Assessment Flow...\n');
    
    // Step 1: Admin login to create test data
    console.log('1. Admin login...');
    const adminLogin = await axios.post('http://localhost:5020/api/auth/login', {
      email: 'admin@couponassessment.com',
      password: 'Admin@123'
    });
    console.log('✅ Admin logged in');
    
    const adminToken = adminLogin.data.data.token;
    
    // Step 2: Test coupon redemption (this is where the error occurs)
    console.log('\n2. Testing coupon redemption...');
    try {
      const redemptionResponse = await axios.post('http://localhost:5020/api/user/coupons/redeem', {
        couponName: 'STREAM_FINDER'
      }, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Coupon redemption successful!');
      console.log('📋 Redemption data:', redemptionResponse.data);
      
    } catch (redeemError) {
      console.error('❌ Coupon redemption failed:', {
        status: redeemError.response?.status,
        message: redeemError.response?.data?.message,
        data: redeemError.response?.data
      });
      
      if (redeemError.response?.status === 404) {
        console.log('\n💡 Coupon not found. Creating test coupon...');
        // We'll handle this in the setup script
      }
      return; // Stop here if coupon redemption fails
    }
    
    // Step 3: Test question generation (ExamPage functionality)
    console.log('\n3. Testing Gemini question generation...');
    try {
      const questionResponse = await axios.post('http://localhost:5020/api/gemini/generate-question', {
        assessmentType: 'Stream Finder',
        userDetails: {
          name: 'Test Student',
          grade: '10',
          city: 'Mumbai',
          state: 'Maharashtra',
          email: 'test@example.com'
        },
        conversationHistory: []
      });
      
      console.log('✅ Question generation successful!');
      console.log('📋 Generated question:', {
        question: questionResponse.data.data.question,
        optionsCount: questionResponse.data.data.options.length
      });
      
    } catch (questionError) {
      console.error('❌ Question generation failed:', {
        status: questionError.response?.status,
        message: questionError.response?.data?.message
      });
      return;
    }
    
    // Step 4: Test report generation
    console.log('\n4. Testing report generation...');
    try {
      const reportResponse = await axios.post('http://localhost:5020/api/gemini/generate-report', {
        assessmentType: 'Stream Finder',
        userDetails: {
          name: 'Test Student',
          grade: '10',
          city: 'Mumbai',
          state: 'Maharashtra',
          email: 'test@example.com'
        },
        conversationHistory: [
          {
            question: "What subjects do you enjoy the most in school?",
            answer: "I enjoy Mathematics and Physics",
            questionNumber: 1
          },
          {
            question: "What type of career interests you?",
            answer: "Engineering and Technology",
            questionNumber: 2
          }
        ]
      });
      
      console.log('✅ Report generation successful!');
      console.log('📋 Report preview:', reportResponse.data.data.report.substring(0, 200) + '...');
      
    } catch (reportError) {
      console.error('❌ Report generation failed:', {
        status: reportError.response?.status,
        message: reportError.response?.data?.message
      });
    }
    
    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📝 Summary:');
    console.log('✅ If all steps passed, the assessment flow should work completely');
    console.log('✅ User can redeem coupon → go to exam → answer 12 questions → get report');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testCompleteFlow();
