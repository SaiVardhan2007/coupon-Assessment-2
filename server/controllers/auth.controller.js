const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Helper function to sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
};

// Signup function
const signup = async (req, res) => {
  try {
    let { name, email, password, phone, currentStudies, city, state } = req.body;
    
    // Sanitize all string inputs
    name = sanitizeInput(name);
    email = sanitizeInput(email);
    city = sanitizeInput(city);
    state = sanitizeInput(state);
    phone = sanitizeInput(phone);

    // Validate required fields
    if (!name || !email || !password || !phone || !currentStudies || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone, currentStudies, city, state'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Determine user role based on ADMIN_EMAIL
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

    // Create new user (password will be hashed automatically by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      phone,
      currentStudies,
      city,
      state,
      role
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const tokenPayload = user.getJWTToken();
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.toJSON(), // This excludes password and other sensitive fields
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for admin credentials first
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Try to find existing admin user in database
      let adminUser = await User.findByEmail(email);
      
      if (!adminUser) {
        // Create admin user if it doesn't exist
        try {
          adminUser = new User({
            name: 'Administrator',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            phone: '+1234567890',
            currentStudies: '12',
            city: 'Admin City',
            state: 'Admin State',
            role: 'admin',
            isActive: true
          });
          await adminUser.save();
          console.log('✅ Admin user created in database');
        } catch (createError) {
          console.error('Failed to create admin user:', createError);
          // Fall back to hardcoded admin if creation fails
          const adminId = '507f1f77bcf86cd799439011';
          const token = jwt.sign(
            {
              id: adminId,
              name: 'Administrator',
              email: process.env.ADMIN_EMAIL,
              role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
          
          return res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: {
              user: {
                id: adminId,
                name: 'Administrator',
                email: process.env.ADMIN_EMAIL,
                role: 'admin'
              },
              token
            }
          });
        }
      }
      
      // Generate JWT for admin using real database user
      const token = jwt.sign(
        {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          },
          token
        }
      });
    }

    // Find user in database (include password for comparison)
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const tokenPayload = user.getJWTToken();
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(), // This excludes password and other sensitive fields
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  login
};
