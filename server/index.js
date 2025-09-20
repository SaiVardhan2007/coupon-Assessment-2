const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const geminiRoutes = require('./routes/gemini.routes');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(generalLimiter); // Apply rate limiting to all routes

// Database connection
const connectDB = async () => {
  try {
    // Try Atlas connection first
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb.net')) {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      console.log('✅ MongoDB Atlas connected successfully');
    } else {
      throw new Error('No Atlas URI or using local fallback');
    }
  } catch (error) {
    console.log('⚠️  Atlas connection failed, trying local MongoDB...');
    try {
      await mongoose.connect('mongodb://localhost:27017/coupon_assessment', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Local MongoDB connected successfully');
    } catch (localError) {
      console.error('❌ Both Atlas and local MongoDB connection failed:');
      console.error('Atlas error:', error.message);
      console.error('Local error:', localError.message);
      console.log('\n💡 Solutions:');
      console.log('1. Whitelist your IP in MongoDB Atlas');
      console.log('2. Install and start local MongoDB: brew install mongodb-community && brew services start mongodb-community');
      process.exit(1);
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Coupon Assessment API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Gemini AI routes
app.use('/api/gemini', geminiRoutes);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
