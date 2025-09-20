require('dotenv').config();

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

// Test the exact login comparison
const testEmail = 'admin@couponassessment.com';
const testPassword = 'Admin@123';

console.log('\nLogin comparison test:');
console.log('Email match:', testEmail === process.env.ADMIN_EMAIL);
console.log('Password match:', testPassword === process.env.ADMIN_PASSWORD);