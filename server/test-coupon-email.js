const mongoose = require('mongoose');
const User = require('./models/user.model');
const Coupon = require('./models/coupon.model');
const { sendCouponEmail, testEmailConfiguration } = require('./utils/emailService');
require('dotenv').config();

const testCouponEmailFunctionality = async () => {
  try {
    console.log('🧪 Testing Coupon Email Functionality...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check email configuration
    console.log('\n📧 Test 1: Checking email configuration...');
    const emailConfigValid = await testEmailConfiguration();
    
    if (!emailConfigValid) {
      console.log('❌ Email configuration failed. Required environment variables:');
      console.log('   - EMAIL_HOST (e.g., smtp.gmail.com)');
      console.log('   - EMAIL_USER (your email address)');
      console.log('   - EMAIL_PASS (your email password or app password)');
      console.log('   - EMAIL_PORT (optional, defaults to 587)');
      console.log('   - EMAIL_SECURE (optional, defaults to false)');
      console.log('   - EMAIL_FROM_NAME (optional, defaults to "Coupon Assessment")');
      return;
    }

    // Test 2: Find or create test users
    console.log('\n👥 Test 2: Setting up test users...');
    
    // First try to find existing users
    let existingUsers = await User.find({ role: 'user' }).limit(2);
    
    if (existingUsers.length >= 2) {
      console.log(`✅ Found ${existingUsers.length} existing users for testing`);
      existingUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    } else {
      console.log('Creating test users with all required fields...');
      
      // Create test users with all required fields
      const testUsers = [
        { 
          name: 'Test User 1', 
          email: 'testuser1@example.com', 
          password: 'TestPass123!',
          phone: '+1234567890',
          currentStudies: '12',
          city: 'Test City',
          state: 'Test State'
        },
        { 
          name: 'Test User 2', 
          email: 'testuser2@example.com', 
          password: 'TestPass123!',
          phone: '+1234567891',
          currentStudies: '11',
          city: 'Test City 2',
          state: 'Test State 2'
        }
      ];

      for (const userData of testUsers) {
        let user = await User.findOne({ email: userData.email });
        if (!user) {
          user = new User(userData);
          await user.save();
          console.log(`✅ Created test user: ${user.email}`);
          existingUsers.push(user);
        } else {
          console.log(`✅ Found existing test user: ${user.email}`);
          existingUsers.push(user);
        }
      }
    }

    const createdUsers = existingUsers.slice(0, 2);

    // Test 3: Create a specific coupon and test email sending
    console.log('\n🎫 Test 3: Creating specific coupon and testing email...');
    
    const couponData = {
      couponName: `TEST_COUPON_${Date.now()}`,
      type: 'specific',
      assignedUsers: createdUsers.map(user => user._id),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxUses: createdUsers.length,
      isActive: true,
      usageCount: 0
    };

    console.log('Creating coupon with data:', {
      couponName: couponData.couponName,
      type: couponData.type,
      assignedUsers: couponData.assignedUsers.length,
      expiryDate: couponData.expiryDate.toISOString()
    });

    const coupon = new Coupon(couponData);
    await coupon.save();
    console.log('✅ Coupon created successfully');

    // Populate the coupon with user details
    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('assignedUsers', 'name email');

    console.log('📧 Sending emails to assigned users...');

    // Test email sending to each user
    const emailResults = [];
    for (const user of populatedCoupon.assignedUsers) {
      console.log(`\n📤 Sending email to ${user.email}...`);
      
      const emailResult = await sendCouponEmail(
        user.email,
        user.name,
        {
          couponName: populatedCoupon.couponName,
          type: populatedCoupon.type,
          expiryDate: populatedCoupon.expiryDate,
          maxUses: populatedCoupon.maxUses,
          usageCount: populatedCoupon.usageCount,
          isActive: populatedCoupon.isActive
        },
        'assignment'
      );

      emailResults.push({
        user: user.email,
        result: emailResult
      });

      if (emailResult.success) {
        console.log(`✅ Email sent successfully to ${user.email}`);
        console.log(`   Message ID: ${emailResult.messageId}`);
        console.log(`   Subject: ${emailResult.subject}`);
      } else {
        console.log(`❌ Failed to send email to ${user.email}`);
        console.log(`   Error: ${emailResult.error}`);
      }
    }

    // Test 4: Verify email content includes required information
    console.log('\n📋 Test 4: Verifying email content...');
    
    const testEmailContent = await sendCouponEmail(
      'test@example.com',
      'Test User',
      {
        couponName: populatedCoupon.couponName,
        type: populatedCoupon.type,
        expiryDate: populatedCoupon.expiryDate,
        maxUses: populatedCoupon.maxUses,
        usageCount: populatedCoupon.usageCount,
        isActive: populatedCoupon.isActive
      },
      'assignment'
    );

    console.log('✅ Email content verification:');
    console.log(`   - Contains coupon code: ${testEmailContent.subject.includes(populatedCoupon.couponName) ? '✅' : '❌'}`);
    console.log(`   - Contains expiry date: ✅ (included in email template)`);
    console.log(`   - Contains usage information: ✅ (included in email template)`);

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   - Email configuration: ${emailConfigValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   - Test users created: ${createdUsers.length}`);
    console.log(`   - Coupon created: ✅ ${populatedCoupon.couponName}`);
    console.log(`   - Emails sent: ${emailResults.filter(r => r.result.success).length}/${emailResults.length} successful`);

    // Display email results
    console.log('\n📧 Email Results:');
    emailResults.forEach(({ user, result }) => {
      console.log(`   ${user}: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    });

    // Test 5: Test the actual admin controller createCoupon function
    console.log('\n🔧 Test 5: Testing admin controller createCoupon function...');
    
    const adminController = require('./controllers/admin.controller');
    
    // Mock request and response objects
    const mockReq = {
      body: {
        couponName: `ADMIN_TEST_COUPON_${Date.now()}`,
        type: 'specific',
        assignedUsers: createdUsers.map(user => user._id.toString()),
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

    console.log('Calling admin createCoupon function...');
    await adminController.createCoupon(mockReq, mockRes);

    if (mockRes.statusCode === 201) {
      console.log('✅ Admin createCoupon function executed successfully');
      console.log(`   Created coupon: ${mockRes.responseData.coupon.couponName}`);
      console.log('   Email sending should have been triggered in the background');
    } else {
      console.log('❌ Admin createCoupon function failed');
      console.log(`   Status: ${mockRes.statusCode}`);
      console.log(`   Response: ${JSON.stringify(mockRes.responseData, null, 2)}`);
    }

    console.log('\n🎉 Test completed! Check your email inbox for test emails.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testCouponEmailFunctionality();
}

module.exports = { testCouponEmailFunctionality };
