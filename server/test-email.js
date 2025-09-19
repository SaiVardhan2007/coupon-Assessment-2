/**
 * Test script for email service
 * Run with: node test-email.js
 */

require('dotenv').config();
const { sendCouponEmail, testEmailConfiguration } = require('./utils/emailService');

const testEmailService = async () => {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Check configuration
  console.log('1. Testing email configuration...');
  const configTest = await testEmailConfiguration();
  
  if (!configTest) {
    console.log('❌ Email configuration test failed. Please check your .env file.');
    console.log('Required variables: EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
    return;
  }

  // Test 2: Send a test coupon email
  console.log('\n2. Sending test coupon email...');
  
  const testUser = {
    email: 'test@example.com', // Change this to your test email
    name: 'Test User'
  };

  const testCoupon = {
    couponName: 'WELCOME2025',
    discountValue: 25,
    discountType: 'percentage',
    description: 'Welcome discount for new users',
    type: 'general',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxUses: 100,
    usageCount: 5,
    isActive: true
  };

  try {
    const result = await sendCouponEmail(
      testUser.email,
      testUser.name,
      testCoupon,
      'assignment'
    );

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📮 Sent to:', result.recipient);
      console.log('\nCheck your email inbox for the test coupon email.');
    } else {
      console.log('❌ Test email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test email error:', error.message);
  }

  console.log('\n🔚 Email service test completed.');
};

// Run the test if this script is executed directly
if (require.main === module) {
  testEmailService().catch(console.error);
}

module.exports = { testEmailService };
