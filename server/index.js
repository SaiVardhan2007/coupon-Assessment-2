const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coupon_assessment', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
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

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
