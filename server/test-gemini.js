// Test file for Gemini API integration
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 5020}/api`;

// Test authentication and Gemini API
async function testGeminiIntegration() {
  try {
    console.log('🚀 Testing Gemini API Integration...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: process.env.ADMIN_EMAIL || 'admin@couponassessment.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test Gemini API connection
    console.log('\n2. Testing Gemini API connection...');
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/gemini/test`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Gemini API connection test:', testResponse.data.message);
      console.log('📝 Response:', testResponse.data.data.response);
    } catch (error) {
      console.log('❌ Gemini API connection failed:', error.response?.data?.message || error.message);
      console.log('💡 Make sure to add your actual Gemini API key to the .env file');
    }

    // Step 3: Test text generation
    console.log('\n3. Testing text generation...');
    try {
      const textResponse = await axios.post(`${API_BASE_URL}/gemini/generate-text`, {
        prompt: 'Write a brief welcome message for students using a coupon assessment platform.'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Text generation successful');
      console.log('📝 Generated text:', textResponse.data.data.generatedText);
    } catch (error) {
      console.log('❌ Text generation failed:', error.response?.data?.message || error.message);
    }

    // Step 4: Test assessment question generation
    console.log('\n4. Testing assessment question generation...');
    try {
      const questionsResponse = await axios.post(`${API_BASE_URL}/gemini/generate-questions`, {
        subject: 'Mathematics',
        grade: '10',
        numberOfQuestions: 3,
        difficulty: 'medium'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Assessment questions generation successful');
      console.log('📝 Generated questions:', JSON.stringify(questionsResponse.data.data.questions, null, 2));
    } catch (error) {
      console.log('❌ Assessment questions generation failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Test coupon description generation
    console.log('\n5. Testing coupon description generation...');
    try {
      const descriptionResponse = await axios.post(`${API_BASE_URL}/gemini/generate-coupon-description`, {
        title: 'Student Discount - Math Tutoring',
        discount: '20% off',
        category: 'Education',
        targetAudience: 'High School Students'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Coupon description generation successful');
      console.log('📝 Generated description:', descriptionResponse.data.data.description);
    } catch (error) {
      console.log('❌ Coupon description generation failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Gemini API integration testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
if (require.main === module) {
  testGeminiIntegration();
}

module.exports = { testGeminiIntegration };
