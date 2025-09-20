const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Testing minimal server startup...');

const app = express();
const PORT = process.env.PORT || 5020;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Minimal server is working!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Start server
try {
  app.listen(PORT, () => {
    console.log(`✅ Minimal server is running on port ${PORT}`);
    console.log(`🌐 Test URL: http://localhost:${PORT}`);
    console.log('🎯 If this works, the issue is in your main server file.');
  });
} catch (error) {
  console.error('❌ Server startup failed:', error.message);
}
