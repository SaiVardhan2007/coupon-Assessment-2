const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', {
        id: existingAdmin._id,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
    } else {
      console.log('📝 Creating admin user...');
      
      // Create admin user with a simple password that meets validation
      const adminUser = new User({
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
      console.log('✅ Admin user created successfully:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      });
      
      // Update the admin ID in auth controller to use this real ID
      console.log('📝 Update your auth controller to use this admin ID:', adminUser._id);
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}

createAdminUser();
