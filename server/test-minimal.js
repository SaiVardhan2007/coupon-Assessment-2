// Minimal test to check what's causing the server to hang
console.log('Starting minimal test...');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config();
  console.log('✅ dotenv loaded');

  console.log('2. Loading express...');
  const express = require('express');
  console.log('✅ express loaded');

  console.log('3. Loading mongoose...');
  const mongoose = require('mongoose');
  console.log('✅ mongoose loaded');

  console.log('4. Loading cors...');
  const cors = require('cors');
  console.log('✅ cors loaded');

  console.log('5. Loading rate limiter...');
  const { generalLimiter } = require('./middleware/rateLimiter');
  console.log('✅ rate limiter loaded');

  console.log('6. Loading routes...');
  const authRoutes = require('./routes/auth.routes');
  console.log('✅ auth routes loaded');
  
  const userRoutes = require('./routes/user.routes');
  console.log('✅ user routes loaded');
  
  const adminRoutes = require('./routes/admin.routes');
  console.log('✅ admin routes loaded');
  
  const geminiRoutes = require('./routes/gemini.routes');
  console.log('✅ gemini routes loaded');

  console.log('7. Testing MongoDB connection...');
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coupon_assessment', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  };

  connectDB();

} catch (error) {
  console.error('❌ Error during loading:', error);
  process.exit(1);
}
