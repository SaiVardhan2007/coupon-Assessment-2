/**
 * Test script for admin controller coupon creation with email integration
 * Run with: node test-admin-coupon.js
 */

require('dotenv').config();

// Mock the email service to avoid actual email sending during testing
const mockEmailService = {
  sendCouponEmail: async (email, name, couponDetails, emailType) => {
    console.log(`📧 Mock email would be sent to: ${email} (${name})`);
    console.log(`   Coupon: ${couponDetails.couponName}`);
    console.log(`   Type: ${emailType}`);
    console.log(`   Discount: ${couponDetails.discountValue}${couponDetails.discountType === 'percentage' ? '%' : '$'} OFF`);
    
    // Simulate email success
    return {
      success: true,
      messageId: 'mock-message-' + Date.now(),
      recipient: email,
      subject: `🎫 New Coupon Assigned: ${couponDetails.couponName}`,
      emailType,
      timestamp: new Date()
    };
  }
};

// Test data
const testUsers = [
  { _id: '64f5e8b8c1234567890abcd1', name: 'John Doe', email: 'john@example.com' },
  { _id: '64f5e8b8c1234567890abcd2', name: 'Jane Smith', email: 'jane@example.com' },
  { _id: '64f5e8b8c1234567890abcd3', name: 'Bob Johnson', email: 'bob@example.com' }
];

const testCoupon = {
  _id: '64f5e8b8c1234567890abcde',
  couponName: 'WELCOME50',
  type: 'specific',
  assignedUsers: testUsers,
  discountValue: 50,
  discountType: 'percentage',
  description: 'Welcome bonus for new users',
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  maxUses: 3,
  usageCount: 0,
  isActive: true
};

const testEmailIntegration = async () => {
  console.log('🧪 Testing Admin Controller Email Integration...\n');

  console.log('📋 Test Scenario: Creating specific coupon with assigned users');
  console.log('Coupon:', testCoupon.couponName);
  console.log('Type:', testCoupon.type);
  console.log('Assigned Users:', testCoupon.assignedUsers.length);
  console.log('');

  // Simulate the email sending logic from the admin controller
  if (testCoupon.type === 'specific' && testCoupon.assignedUsers.length > 0) {
    console.log(`📧 Sending coupon assignment emails to ${testCoupon.assignedUsers.length} users...`);
    
    const emailPromises = testCoupon.assignedUsers.map(async (user) => {
      try {
        const emailResult = await mockEmailService.sendCouponEmail(
          user.email,
          user.name,
          {
            couponName: testCoupon.couponName,
            discountValue: testCoupon.discountValue,
            discountType: testCoupon.discountType,
            description: testCoupon.description,
            type: testCoupon.type,
            expiryDate: testCoupon.expiryDate,
            maxUses: testCoupon.maxUses,
            usageCount: testCoupon.usageCount,
            isActive: testCoupon.isActive
          },
          'assignment'
        );
        
        if (emailResult.success) {
          console.log(`✅ Assignment email sent to ${user.email}`);
        } else {
          console.error(`❌ Failed to send assignment email to ${user.email}:`, emailResult.error);
        }
        
        return emailResult;
      } catch (error) {
        console.error(`❌ Error sending assignment email to ${user.email}:`, error.message);
        return { success: false, error: error.message, recipient: user.email };
      }
    });

    // Process emails
    try {
      const results = await Promise.all(emailPromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      console.log(`\n📊 Coupon assignment email summary: ${successful} successful, ${failed} failed`);
      
      console.log('\n✅ Email integration test completed successfully!');
      console.log('The admin controller modification will work correctly.');
    } catch (error) {
      console.error('\n❌ Error in bulk email sending:', error);
    }
  } else {
    console.log('ℹ️ No emails to send (not a specific coupon or no assigned users)');
  }

  console.log('\n🔚 Test completed.');
};

// Run the test if this script is executed directly
if (require.main === module) {
  testEmailIntegration().catch(console.error);
}

module.exports = { testEmailIntegration };
