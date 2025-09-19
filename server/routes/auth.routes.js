const express = require('express');
const { signup, login } = require('../controllers/auth.controller');
const { loginLimiter, signupLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signupLimiter, signup);

// POST /api/auth/login
router.post('/login', loginLimiter, login);

module.exports = router;
