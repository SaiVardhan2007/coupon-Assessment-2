const mongoose = require('mongoose');
const User = require('./models/user.model');
const Coupon = require('./models/coupon.model');
const { sendCouponEmail, testEmailConfiguration } = require('./utils/emailService');
require('dotenv').config();

const debugEmailDelivery = async () => {
  try {
    console.log('🔍 Debugging Email Delivery Issues...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check environment variables
    console.log('\n📧 Email Configuration Check:');
    console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
    console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET (defaults to 587)'}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***SET***' : 'NOT SET'}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
    console.log(`EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'NOT SET (defaults to "Coupon Assessment")'}`);
    console.log(`EMAIL_SECURE: ${process.env.EMAIL_SECURE || 'NOT SET (defaults to false)'}`);

    // Test email configuration
    console.log('\n🧪 Testing Email Configuration...');
    const configValid = await testEmailConfiguration();
    
    if (!configValid) {
      console.log('❌ Email configuration test failed!');
      return;
    }

    // Ask for user's email address for testing
    console.log('\n📬 Testing with Real Email Address...');
    console.log('Please provide your email address to test email delivery.');
    console.log('You can modify this script to include your email address.');
    
    // Test with the user's actual email address
    const testEmail = 'polampallisaivardhan1423@gmail.com'; // Fixed the typo from ggmail to gmail

    // Create a test coupon for email testing
    const testCouponData = {
      couponName: `EMAIL_TEST_${Date.now()}`,
      type: 'general',
      maxUses: 1,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isActive: true,
      usageCount: 0,
      assignedUsers: []
    };

    console.log(`\n🎫 Creating test coupon: ${testCouponData.couponName}`);
    
    // Send test email
    console.log(`📤 Sending test email to: ${testEmail}`);
    
    const emailResult = await sendCouponEmail(
      testEmail,
      'Test User',
      testCouponData,
      'assignment'
    );

    console.log('\n📊 Email Sending Result:');
    console.log(JSON.stringify(emailResult, null, 2));

    if (emailResult.success) {
      console.log('\n✅ Email sent successfully!');
      console.log(`Message ID: ${emailResult.messageId}`);
      console.log(`Subject: ${emailResult.subject}`);
      console.log('\n📋 Next Steps:');
      console.log('1. Check your email inbox');
      console.log('2. Check your spam/junk folder');
      console.log('3. Check your email provider\'s blocked senders list');
      console.log('4. Verify the EMAIL_FROM address is authorized to send from your SMTP provider');
      
      // Additional debugging info
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('- If using Gmail SMTP, ensure you\'re using an App Password, not your regular password');
      console.log('- If using Brevo/Sendinblue, verify your sender email is verified in their dashboard');
      console.log('- Some email providers require the FROM address to match the authenticated user');
      console.log('- Check if your SMTP provider has daily sending limits');
      
    } else {
      console.log('\n❌ Email sending failed!');
      console.log(`Error: ${emailResult.error}`);
      
      console.log('\n🔧 Common Issues:');
      console.log('1. SMTP authentication failure - check EMAIL_USER and EMAIL_PASS');
      console.log('2. FROM address not authorized - EMAIL_FROM must be verified with your SMTP provider');
      console.log('3. SMTP server blocking - check if your IP is blacklisted');
      console.log('4. Rate limiting - too many emails sent too quickly');
    }

    // Test with the admin controller to simulate real coupon creation
    console.log('\n🔄 Testing Real Coupon Creation Flow...');
    
    // Find a real user to test with
    const realUser = await User.findOne({ role: 'user' });
    if (realUser) {
      console.log(`Found real user: ${realUser.name} (${realUser.email})`);
      
      // Create a real coupon using the admin controller
      const adminController = require('./controllers/admin.controller');
      
      const mockReq = {
        body: {
          couponName: `REAL_TEST_${Date.now()}`,
          type: 'specific',
          assignedUsers: [realUser._id.toString()],
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      const mockRes = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.responseData = data;
          return this;
        }
      };

      console.log('Creating coupon through admin controller...');
      await adminController.createCoupon(mockReq, mockRes);

      if (mockRes.statusCode === 201) {
        console.log('✅ Coupon created successfully through admin controller');
        console.log(`Email should be sent to: ${realUser.email}`);
        console.log('Check that email address for the coupon notification');
      } else {
        console.log('❌ Coupon creation failed');
        console.log(`Status: ${mockRes.statusCode}`);
        console.log(`Response: ${JSON.stringify(mockRes.responseData, null, 2)}`);
      }
    } else {
      console.log('⚠️  No real users found in database for testing');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Run the debug
if (require.main === module) {
  debugEmailDelivery();
}

module.exports = { debugEmailDelivery };
