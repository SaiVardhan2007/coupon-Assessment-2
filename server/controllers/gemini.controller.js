const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate text using Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateText = async (req, res) => {
  try {
    const { prompt, maxTokens = 1000 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add your API key to the .env file.'
      });
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      message: 'Text generated successfully',
      data: {
        prompt,
        generatedText: text,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Gemini API key. Please check your API key configuration.'
      });
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({
        success: false,
        message: 'Gemini API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate text with Gemini AI',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Generate assessment questions using Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateAssessmentQuestions = async (req, res) => {
  try {
    const { 
      subject = 'General Knowledge', 
      grade = '10', 
      numberOfQuestions = 5,
      difficulty = 'medium'
    } = req.body;

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add your API key to the .env file.'
      });
    }

    const prompt = `Generate ${numberOfQuestions} multiple choice questions for Grade ${grade} ${subject} with ${difficulty} difficulty level. 

Format each question as JSON with the following structure:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of the correct answer"
}

Return only a valid JSON array of questions without any additional text or formatting.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    let questions;
    try {
      // Clean the response text and extract JSON
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse generated questions:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse generated questions. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Assessment questions generated successfully',
      data: {
        subject,
        grade,
        difficulty,
        numberOfQuestions: questions.length,
        questions,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating assessment questions:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate assessment questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Generate coupon descriptions using Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateCouponDescription = async (req, res) => {
  try {
    const { 
      title,
      discount,
      category = 'General',
      targetAudience = 'Students'
    } = req.body;

    if (!title || !discount) {
      return res.status(400).json({
        success: false,
        message: 'Title and discount are required'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add your API key to the .env file.'
      });
    }

    const prompt = `Create an engaging and professional coupon description for:
Title: ${title}
Discount: ${discount}
Category: ${category}
Target Audience: ${targetAudience}

The description should be:
- Appealing and persuasive
- 2-3 sentences long
- Highlight the value proposition
- Be suitable for ${targetAudience}
- Professional but friendly tone

Return only the description text without quotes or additional formatting.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text().trim();

    res.json({
      success: true,
      message: 'Coupon description generated successfully',
      data: {
        title,
        discount,
        category,
        targetAudience,
        description,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating coupon description:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate coupon description',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Test Gemini API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testConnection = async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add your API key to the .env file.'
      });
    }

    // Simple test prompt
    const result = await model.generateContent('Say "Hello from Gemini!" and confirm the API is working.');
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      message: 'Gemini API connection successful',
      data: {
        response: text,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error testing Gemini API connection:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Gemini API',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Generate personalized assessment questions for career counseling
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateQuestion = async (req, res) => {
  try {
    const { assessmentType, userDetails, conversationHistory = [] } = req.body;

    // Validate required fields
    if (!assessmentType || !userDetails || !userDetails.grade) {
      return res.status(400).json({
        success: false,
        message: 'Assessment type, user details with grade are required'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add your API key to the .env file.'
      });
    }

    // Construct detailed system prompt
    const systemPrompt = `You are an experienced career counselor and educational guidance expert specializing in the Indian education system. You are conducting a personalized career assessment for a student.

STUDENT PROFILE:
- Grade: ${userDetails.grade}
- Name: ${userDetails.name || 'Student'}
- Location: ${userDetails.city || ''}, ${userDetails.state || ''}
- Assessment Type: ${assessmentType}

CONTEXT & INSTRUCTIONS:
1. You are helping this ${userDetails.grade}th grade student in India explore their career interests, aptitudes, and future educational pathways.
2. Consider the Indian education system: 10th board exams, 11th-12th stream selection (Science, Commerce, Arts), competitive exams like JEE, NEET, CA, etc.
3. Ask questions that help identify their interests, strengths, learning style, and career aspirations.
4. Make questions age-appropriate and relevant to their current academic level.
5. Consider Indian career paths: Engineering, Medicine, Business, Government services, Arts, Sports, Technology, etc.
6. Build upon previous conversation history to avoid repetition and create a natural flow.

CONVERSATION HISTORY:
${conversationHistory.length > 0 ? conversationHistory.map((entry, index) => 
  `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`
).join('\n\n') : 'This is the first question in the assessment.'}

RESPONSE FORMAT:
You MUST respond with a valid JSON object in exactly this format:
{
  "question": "Your personalized question here (keep it conversational and engaging)",
  "options": ["Option A", "Option B", "Option C", "Option D", "Option E"]
}

QUESTION GUIDELINES:
- Make questions specific to ${userDetails.grade}th grade level
- Include 5 diverse options covering different perspectives
- Questions should help identify interests, aptitudes, values, and preferences
- Avoid repetition of topics already covered in conversation history
- Make it engaging and thought-provoking for a ${userDetails.grade}th grader
- Consider Indian educational and career context

Generate your question now:`;

    // Make API call to Gemini
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      // Parse the JSON response
      const questionData = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!questionData.question || !Array.isArray(questionData.options) || questionData.options.length !== 5) {
        throw new Error('Invalid response structure from AI model');
      }

      // Return successful response
      res.json({
        success: true,
        message: 'Question generated successfully',
        data: {
          question: questionData.question,
          options: questionData.options,
          assessmentType,
          userGrade: userDetails.grade,
          questionNumber: conversationHistory.length + 1,
          timestamp: new Date().toISOString()
        }
      });

    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', text);
      
      // Fallback: Try to extract question and options manually
      try {
        // Simple fallback parsing
        const lines = text.split('\n').filter(line => line.trim());
        let question = '';
        let options = [];
        
        for (const line of lines) {
          if (line.includes('question') && line.includes(':')) {
            question = line.split(':').slice(1).join(':').trim().replace(/['"]/g, '');
          } else if (line.includes('options') || line.trim().match(/^[A-E][\.\)]/)) {
            // Try to extract options
            const optionMatch = line.match(/["'](.*?)["']/g);
            if (optionMatch) {
              options = optionMatch.map(opt => opt.replace(/['"]/g, ''));
            }
          }
        }
        
        if (question && options.length >= 4) {
          return res.json({
            success: true,
            message: 'Question generated successfully (fallback parsing)',
            data: {
              question,
              options: options.slice(0, 5),
              assessmentType,
              userGrade: userDetails.grade,
              questionNumber: conversationHistory.length + 1,
              timestamp: new Date().toISOString()
            }
          });
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response. The model did not return valid JSON format.',
        error: parseError.message,
        rawResponse: text.substring(0, 500) // Truncate for debugging
      });
    }

  } catch (error) {
    console.error('Error generating question with Gemini:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Gemini API key. Please check your API key configuration.'
      });
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({
        success: false,
        message: 'API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate question',
      error: error.message || 'Unknown error occurred'
    });
  }
};

// Generate personalized report based on complete conversation
const generateReport = async (req, res) => {
  try {
    const { 
      assessmentType,
      userDetails,
      conversationHistory
    } = req.body;

    // Validate required fields
    if (!userDetails || !conversationHistory) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userDetails and conversationHistory are required'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add your API key to the .env file.'
      });
    }

    // Extract user grade and ensure it's valid
    const userGrade = userDetails.currentStudies || userDetails.grade || '10';
    
    // Construct detailed system prompt for report generation
    const systemPrompt = `You are an experienced career counselor and educational advisor specializing in the Indian education system. Your task is to analyze a student's conversation history and generate a comprehensive, personalized academic and career guidance report.

STUDENT PROFILE:
- Name: ${userDetails.name || 'Student'}
- Grade: ${userGrade}
- Location: ${userDetails.city || 'Not specified'}, ${userDetails.state || 'India'}
- Assessment Type: ${assessmentType || 'Career Counseling'}

ANALYSIS REQUIREMENTS:
1. Carefully analyze the entire conversation history provided
2. Identify patterns in the student's responses that indicate:
   - Academic interests and strengths
   - Personality traits and learning preferences
   - Career inclinations and aspirations
   - Subject preferences and aptitude

REPORT STRUCTURE:
Generate a comprehensive report with the following sections:

1. **PERSONALITY ASSESSMENT**: Analyze the student's responses to understand their personality type, learning style, and behavioral patterns.

2. **ACADEMIC STRENGTHS**: Identify subjects and areas where the student shows interest or aptitude based on their responses.

3. **RECOMMENDED STREAM**: Based on the student's grade (${userGrade}) and responses, recommend the most suitable academic stream:
   - **Science Stream**: For students showing interest in STEM fields, analytical thinking, and technical subjects
   - **Commerce Stream**: For students interested in business, economics, entrepreneurship, and financial matters
   - **Arts/Humanities Stream**: For students with creative inclinations, interest in social sciences, languages, and liberal arts

4. **CAREER SUGGESTIONS**: Provide 3-5 specific career paths that align with the student's interests and chosen stream.

5. **ACADEMIC PLANNING**: Suggest specific subjects to focus on and additional skills to develop.

6. **NEXT STEPS**: Provide actionable recommendations for the student's immediate academic future.

CONVERSATION HISTORY TO ANALYZE:
${JSON.stringify(conversationHistory, null, 2)}

Please generate a detailed, personalized report in a professional yet encouraging tone. Make sure the recommendations are practical and relevant to the Indian education system and job market. The report should be at least 500 words and provide concrete, actionable advice.

Format the response as plain text (not JSON) with clear section headings and proper paragraph breaks.`;

    // Generate the report using Gemini
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const reportText = response.text();

    // Send the generated report back to the client
    res.json({
      success: true,
      data: {
        report: reportText,
        userDetails: {
          name: userDetails.name,
          grade: userGrade,
          assessmentType
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Gemini API key. Please check your API key configuration.'
      });
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({
        success: false,
        message: 'API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message || 'Unknown error occurred'
    });
  }
};

module.exports = {
  generateText,
  generateAssessmentQuestions,
  generateCouponDescription,
  testConnection,
  generateQuestion,
  generateReport
};
