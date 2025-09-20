const express = require('express');
const router = express.Router();
const { authenticateToken, requireAuth } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin');
const {
  generateText,
  generateAssessmentQuestions,
  generateCouponDescription,
  testConnection,
  generateQuestion,
  generateReport
} = require('../controllers/gemini.controller');

/**
 * @route GET /api/gemini/test
 * @desc Test Gemini API connection
 * @access Private (Admin only)
 */
router.get('/test', authenticateToken, requireAuth, isAdmin, testConnection);

/**
 * @route POST /api/gemini/generate-text
 * @desc Generate text using Gemini AI
 * @access Private (Admin only)
 */
router.post('/generate-text', authenticateToken, requireAuth, isAdmin, generateText);

/**
 * @route POST /api/gemini/generate-questions
 * @desc Generate assessment questions using Gemini AI
 * @access Private (Admin only)
 */
router.post('/generate-questions', authenticateToken, requireAuth, isAdmin, generateAssessmentQuestions);

/**
 * @route POST /api/gemini/generate-coupon-description
 * @desc Generate coupon description using Gemini AI
 * @access Private (Admin only)
 */
router.post('/generate-coupon-description', authenticateToken, requireAuth, isAdmin, generateCouponDescription);

/**
 * @route POST /api/gemini/generate-question
 * @desc Generate personalized career counseling question using Gemini AI
 * @access Private (Authenticated users)
 */
router.post('/generate-question', authenticateToken, requireAuth, generateQuestion);

/**
 * @route POST /api/gemini/generate-report
 * @desc Generate personalized career counseling report using Gemini AI
 * @access Private (Authenticated users)
 */
router.post('/generate-report', authenticateToken, requireAuth, generateReport);

module.exports = router;
