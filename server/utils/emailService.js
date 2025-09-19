const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  // For development, log the configuration (without password)
  if (process.env.NODE_ENV === 'development') {
    console.log('Email configuration:', {
      ...config,
      auth: { user: config.auth.user, pass: '***' }
    });
  }

  return nodemailer.createTransport(config);
};

// HTML email template for coupon notifications
const getCouponEmailTemplate = (userName, couponDetails, emailType = 'assignment') => {
  const baseStyles = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8fafc;
      }
      .email-container {
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }
      .header p {
        margin: 10px 0 0 0;
        font-size: 16px;
        opacity: 0.9;
      }
      .content {
        padding: 30px;
      }
      .greeting {
        font-size: 18px;
        color: #2d3748;
        margin-bottom: 20px;
      }
      .coupon-card {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 25px;
        margin: 25px 0;
        text-align: center;
        position: relative;
      }
      .coupon-card::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
        border-radius: 12px;
        z-index: -1;
      }
      .coupon-title {
        font-size: 24px;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 10px;
      }
      .coupon-code {
        background-color: #667eea;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 2px;
        margin: 15px 0;
        display: inline-block;
        border: 3px dashed #4c51bf;
      }
      .discount-badge {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: 600;
        display: inline-block;
        margin: 10px 0;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
        text-align: left;
      }
      .detail-item {
        background-color: #f7fafc;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      .detail-label {
        font-weight: 600;
        color: #4a5568;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .detail-value {
        color: #2d3748;
        font-size: 16px;
        margin-top: 5px;
      }
      .cta-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        display: inline-block;
        margin: 20px 0;
        transition: transform 0.2s;
      }
      .cta-button:hover {
        transform: translateY(-2px);
      }
      .footer {
        background-color: #f7fafc;
        padding: 25px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      .footer p {
        margin: 5px 0;
        color: #718096;
        font-size: 14px;
      }
      .social-links {
        margin: 15px 0;
      }
      .social-links a {
        color: #667eea;
        text-decoration: none;
        margin: 0 10px;
        font-weight: 500;
      }
      .usage-info {
        background-color: #fef5e7;
        border: 1px solid #f6ad55;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
      }
      .usage-info h4 {
        color: #c05621;
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      .usage-info p {
        color: #744210;
        margin: 5px 0;
        font-size: 14px;
      }
      @media (max-width: 600px) {
        body { padding: 10px; }
        .content { padding: 20px; }
        .details-grid { grid-template-columns: 1fr; }
        .coupon-code { font-size: 18px; }
      }
    </style>
  `;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmailContent = () => {
    switch (emailType) {
      case 'assignment':
        return {
          subject: `🎫 New Coupon Assigned: ${couponDetails.couponName}`,
          title: 'New Coupon Assigned!',
          subtitle: 'You have received a new coupon',
          message: `Great news! A new coupon has been assigned to your account. Use it to get exclusive discounts on your next assessment.`,
          ctaText: 'View My Coupons',
          ctaUrl: 'https://yourapp.com/profile'
        };
      case 'redemption':
        return {
          subject: `✅ Coupon Redeemed Successfully: ${couponDetails.couponName}`,
          title: 'Coupon Redeemed!',
          subtitle: 'Your coupon has been successfully applied',
          message: `Congratulations! You have successfully redeemed your coupon. Your discount has been applied and you can now proceed with your assessment.`,
          ctaText: 'Continue Assessment',
          ctaUrl: 'https://yourapp.com/assessments'
        };
      case 'expiry_reminder':
        return {
          subject: `⏰ Coupon Expiring Soon: ${couponDetails.couponName}`,
          title: 'Coupon Expiring Soon!',
          subtitle: 'Use your coupon before it expires',
          message: `Your coupon is expiring soon. Don't miss out on your discount - use it before the expiry date.`,
          ctaText: 'Use Coupon Now',
          ctaUrl: 'https://yourapp.com/assessments'
        };
      default:
        return {
          subject: `🎫 Coupon Notification: ${couponDetails.couponName}`,
          title: 'Coupon Notification',
          subtitle: 'Update about your coupon',
          message: `Here's an update about your coupon.`,
          ctaText: 'View Details',
          ctaUrl: 'https://yourapp.com/profile'
        };
    }
  };

  const emailContent = getEmailContent();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailContent.subject}</title>
      ${baseStyles}
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>${emailContent.title}</h1>
          <p>${emailContent.subtitle}</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="greeting">
            Hello ${userName},
          </div>

          <p>${emailContent.message}</p>

          <!-- Coupon Card -->
          <div class="coupon-card">
            <div class="coupon-title">${couponDetails.couponName}</div>
            
            <div class="discount-badge">
              ${couponDetails.discountValue}${couponDetails.discountType === 'percentage' ? '%' : '$'} OFF
            </div>
            
            ${couponDetails.couponName ? `<div class="coupon-code">${couponDetails.couponName}</div>` : ''}
            
            ${couponDetails.description ? `<p style="color: #4a5568; margin: 15px 0;">${couponDetails.description}</p>` : ''}
          </div>

          <!-- Details Grid -->
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Coupon Type</div>
              <div class="detail-value">${couponDetails.type === 'specific' ? 'Personal Coupon' : 'General Coupon'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Expires On</div>
              <div class="detail-value">${formatDate(couponDetails.expiryDate)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Usage Limit</div>
              <div class="detail-value">${couponDetails.usageCount || 0} / ${couponDetails.maxUses} used</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value" style="color: ${couponDetails.isActive ? '#38a169' : '#e53e3e'};">
                ${couponDetails.isActive ? '✅ Active' : '❌ Inactive'}
              </div>
            </div>
          </div>

          <!-- Usage Instructions -->
          <div class="usage-info">
            <h4>How to Use Your Coupon:</h4>
            <p>• Visit the Assessment page on our platform</p>
            <p>• Select the test you want to take</p>
            <p>• Enter your coupon code when prompted</p>
            <p>• Enjoy your discount and start your assessment!</p>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center;">
            <a href="${emailContent.ctaUrl}" class="cta-button">${emailContent.ctaText}</a>
          </div>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            If you have any questions about your coupon, please don't hesitate to contact our support team.
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Coupon Assessment Platform</strong></p>
          <p>Your learning journey, our priority</p>
          
          <div class="social-links">
            <a href="#">Help Center</a> | 
            <a href="#">Contact Support</a> | 
            <a href="#">Terms of Service</a>
          </div>
          
          <p style="margin-top: 20px;">
            This email was sent to ${userName}. If you didn't expect this email, please ignore it.
          </p>
          <p style="font-size: 12px; color: #a0aec0;">
            © ${new Date().getFullYear()} Coupon Assessment. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send a coupon-related email to a user
 * @param {string} userEmail - Recipient's email address
 * @param {string} userName - Recipient's name
 * @param {Object} couponDetails - Coupon information object
 * @param {string} emailType - Type of email: 'assignment', 'redemption', 'expiry_reminder'
 * @returns {Promise<Object>} - Email sending result
 */
const sendCouponEmail = async (userEmail, userName, couponDetails, emailType = 'assignment') => {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate input parameters
    if (!userEmail || !userName || !couponDetails) {
      throw new Error('Missing required parameters: userEmail, userName, and couponDetails are required');
    }

    if (!couponDetails.couponName) {
      throw new Error('Coupon details must include couponName');
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify connection (optional, for debugging)
    if (process.env.NODE_ENV === 'development') {
      try {
        await transporter.verify();
        console.log('✅ Email server connection verified');
      } catch (verifyError) {
        console.warn('⚠️ Email server verification failed:', verifyError.message);
      }
    }

    // Generate email content
    const htmlContent = getCouponEmailTemplate(userName, couponDetails, emailType);
    
    // Get email subject based on type
    const emailSubjects = {
      assignment: `🎫 New Coupon Assigned: ${couponDetails.couponName}`,
      redemption: `✅ Coupon Redeemed Successfully: ${couponDetails.couponName}`,
      expiry_reminder: `⏰ Coupon Expiring Soon: ${couponDetails.couponName}`
    };

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Coupon Assessment',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: userEmail,
      subject: emailSubjects[emailType] || `🎫 Coupon Notification: ${couponDetails.couponName}`,
      html: htmlContent,
      // Plain text fallback
      text: `
        Hello ${userName},
        
        ${emailType === 'assignment' ? 'You have received a new coupon!' : 
          emailType === 'redemption' ? 'Your coupon has been redeemed successfully!' : 
          'Your coupon is expiring soon!'}
        
        Coupon: ${couponDetails.couponName}
        Discount: ${couponDetails.discountValue}${couponDetails.discountType === 'percentage' ? '%' : '$'} OFF
        Expires: ${new Date(couponDetails.expiryDate).toLocaleDateString()}
        
        Visit our platform to use your coupon: https://yourapp.com
        
        Best regards,
        Coupon Assessment Team
      `
    };

    // Send the email
    const result = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', {
      messageId: result.messageId,
      to: userEmail,
      subject: mailOptions.subject,
      emailType
    });

    return {
      success: true,
      messageId: result.messageId,
      recipient: userEmail,
      subject: mailOptions.subject,
      emailType,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('❌ Error sending coupon email:', error);
    
    return {
      success: false,
      error: error.message,
      recipient: userEmail,
      emailType,
      timestamp: new Date()
    };
  }
};

/**
 * Send bulk coupon emails to multiple users
 * @param {Array} recipients - Array of {email, name} objects
 * @param {Object} couponDetails - Coupon information object
 * @param {string} emailType - Type of email
 * @returns {Promise<Object>} - Bulk sending results
 */
const sendBulkCouponEmails = async (recipients, couponDetails, emailType = 'assignment') => {
  const results = {
    successful: [],
    failed: [],
    total: recipients.length
  };

  console.log(`📧 Sending ${emailType} emails to ${recipients.length} recipients...`);

  // Send emails with a small delay to avoid overwhelming the SMTP server
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const result = await sendCouponEmail(
        recipient.email, 
        recipient.name, 
        couponDetails, 
        emailType
      );
      
      if (result.success) {
        results.successful.push({
          email: recipient.email,
          name: recipient.name,
          messageId: result.messageId
        });
      } else {
        results.failed.push({
          email: recipient.email,
          name: recipient.name,
          error: result.error
        });
      }
    } catch (error) {
      results.failed.push({
        email: recipient.email,
        name: recipient.name,
        error: error.message
      });
    }

    // Add a small delay between emails (100ms)
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`📊 Bulk email results: ${results.successful.length} successful, ${results.failed.length} failed`);

  return results;
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Whether email configuration is working
 */
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration test passed');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    return false;
  }
};

module.exports = {
  sendCouponEmail,
  sendBulkCouponEmails,
  testEmailConfiguration
};
