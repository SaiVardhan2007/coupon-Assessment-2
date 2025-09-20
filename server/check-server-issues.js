console.log('🔍 Checking server startup issues...');

try {
  // Test 1: Environment variables
  console.log('1. Testing environment variables...');
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  console.log('📋 PORT:', process.env.PORT);
  console.log('📋 MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  console.log('📋 JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('📋 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

  // Test 2: Dependencies
  console.log('\n2. Testing dependencies...');
  const express = require('express');
  console.log('✅ express loaded');
  
  const mongoose = require('mongoose');
  console.log('✅ mongoose loaded');
  
  const cors = require('cors');
  console.log('✅ cors loaded');
  
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken loaded');
  
  const bcrypt = require('bcryptjs');
  console.log('✅ bcryptjs loaded');

  // Test 3: Models
  console.log('\n3. Testing models...');
  const User = require('./models/user.model');
  console.log('✅ User model loaded');
  
  const Coupon = require('./models/coupon.model');
  console.log('✅ Coupon model loaded');

  // Test 4: Controllers
  console.log('\n4. Testing controllers...');
  const authController = require('./controllers/auth.controller');
  console.log('✅ auth controller loaded');
  
  const userController = require('./controllers/user.controller');
  console.log('✅ user controller loaded');
  
  const geminiController = require('./controllers/gemini.controller');
  console.log('✅ gemini controller loaded');

  // Test 5: Routes
  console.log('\n5. Testing routes...');
  const authRoutes = require('./routes/auth.routes');
  console.log('✅ auth routes loaded');
  
  const userRoutes = require('./routes/user.routes');
  console.log('✅ user routes loaded');

  // Test 6: Middleware
  console.log('\n6. Testing middleware...');
  const authMiddleware = require('./middleware/auth.middleware');
  console.log('✅ auth middleware loaded');
  
  const rateLimiter = require('./middleware/rateLimiter');
  console.log('✅ rate limiter loaded');

  console.log('\n🎉 All components loaded successfully!');
  console.log('💡 The server should start without issues.');
  console.log('📝 Try running: npm run dev');

} catch (error) {
  console.error('\n❌ Error found:', error.message);
  console.error('📍 Stack trace:', error.stack);
  console.error('\n💡 This is likely the issue preventing server startup.');
}
