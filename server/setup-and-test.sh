#!/bin/bash

echo "🚀 Setting up Assessment Flow for Testing..."

# Navigate to server directory
cd /Users/saivardhanpolampalli/Downloads/coupon_Assessment2/server

echo "📦 Creating test coupons..."
node setup-test-coupons.js

echo "🧪 Testing complete flow..."
node test-complete-flow.js

echo "✅ Setup complete!"
echo ""
echo "📋 Available test coupons:"
echo "   - STREAM_FINDER"
echo "   - CAREER_GUIDE" 
echo "   - SKILL_ASSESSMENT"
echo "   - TEST123"
echo ""
echo "🎯 Now you can:"
echo "   1. Go to your web application"
echo "   2. Log in as admin (admin@couponassessment.com / Admin@123)"
echo "   3. Go to assessments page"
echo "   4. Enter any of the above coupon codes"
echo "   5. Click 'Start Assessment'"
echo "   6. You should be redirected to exam page with Gemini questions!"
