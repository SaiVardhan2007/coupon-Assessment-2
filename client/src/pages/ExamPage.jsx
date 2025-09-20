import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ButtonSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../api';

const ExamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get assessment type from route state
  const assessmentType = location.state?.assessmentType || 'Stream Finder';
  
  // State management
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [error, setError] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);

  // User details for personalization
  const userDetails = {
    name: user?.name || '',
    grade: user?.currentStudies || '10',
    city: user?.city || '',
    state: user?.state || '',
    email: user?.email || ''
  };

  // Load first question on component mount
  useEffect(() => {
    if (!assessmentComplete && !currentQuestion) {
      generateNextQuestion();
    }
  }, []);

  // Redirect if no assessment type
  useEffect(() => {
    if (!location.state?.assessmentType) {
      navigate('/assessments', { 
        replace: true,
        state: { 
          error: 'Please select an assessment type first.' 
        }
      });
    }
  }, [location.state, navigate]);

  const generateNextQuestion = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post('/api/gemini/generate-question', {
        assessmentType,
        userDetails,
        conversationHistory
      });

      if (response.data.success) {
        setCurrentQuestion({
          question: response.data.data.question,
          options: response.data.data.options
        });
      } else {
        throw new Error(response.data.message || 'Failed to generate question');
      }
    } catch (err) {
      console.error('Error generating question:', err);
      setError(err.response?.data?.message || 'Failed to load question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer before proceeding.');
      return;
    }

    if (isLoading) return; // Prevent multiple clicks while loading
    
    try {
      // 1. Set loading to true
      setIsLoading(true);
      setError('');
      
      // 2. Add current question and selected answer to conversation history
      const newHistoryEntry = {
        question: currentQuestion.question,
        answer: selectedAnswer,
        questionNumber: questionNumber
      };
      
      const updatedHistory = [...conversationHistory, newHistoryEntry];
      setConversationHistory(updatedHistory);
      
      // Clear current selections
      setSelectedAnswer('');
      setQuestionNumber(prev => prev + 1);
      
      // 3. Check if we have reached 12 questions
      if (updatedHistory.length >= 12) {
        // 5. Set assessment complete to true (let user manually generate report)
        setAssessmentComplete(true);
      } else {
        // 3. Make another POST call with updated conversation history
        const response = await api.post('/api/gemini/generate-question', {
          assessmentType,
          userDetails,
          conversationHistory: updatedHistory
        });

        if (response.data.success) {
          // 4. Update current question state with new question
          setCurrentQuestion({
            question: response.data.data.question,
            options: response.data.data.options
          });
        } else {
          throw new Error(response.data.message || 'Failed to generate next question');
        }
      }
    } catch (err) {
      console.error('Error handling next question:', err);
      setError(err.response?.data?.message || 'Failed to process your answer. Please try again.');
    } finally {
      // 4. Set loading to false
      setIsLoading(false);
    }
  };

  const generateReport = async (finalHistory) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/api/gemini/generate-report', {
        assessmentType,
        userDetails,
        conversationHistory: finalHistory
      });

      if (response.data.success) {
        // Navigate to results page with report
        navigate('/exam/results', {
          state: {
            assessmentType,
            conversationHistory: finalHistory,
            report: response.data.data.report,
            userDetails
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate your assessment report. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (conversationHistory.length > 0) {
      // Get the last question from history
      const lastEntry = conversationHistory[conversationHistory.length - 1];
      
      // Remove last entry from history
      const updatedHistory = conversationHistory.slice(0, -1);
      setConversationHistory(updatedHistory);
      
      // Set current question to the last one
      setCurrentQuestion({
        question: lastEntry.question,
        options: currentQuestion?.options || ['Option A', 'Option B', 'Option C', 'Option D', 'Option E']
      });
      
      // Set the previous answer as selected
      setSelectedAnswer(lastEntry.answer);
      setQuestionNumber(prev => prev - 1);
    }
  };

  const handleExitAssessment = () => {
    if (window.confirm('Are you sure you want to exit the assessment? Your progress will be lost.')) {
      navigate('/assessments');
    }
  };

  const handleGetReport = async () => {
    try {
      // 1. Set loading to true
      setIsLoading(true);
      setError('');
      
      // 2. Make POST call to generate-report endpoint
      const response = await api.post('/api/gemini/generate-report', {
        assessmentType,
        userDetails,
        conversationHistory
      });

      if (response.data.success) {
        // 3. Navigate to ReportPage with report text in route state
        navigate('/report', {
          state: {
            assessmentType,
            conversationHistory,
            report: response.data.data.report,
            userDetails
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate your assessment report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <ButtonSpinner />
          <p className="mt-4 text-lg text-gray-600">
            {questionNumber === 1 ? 'Preparing your personalized assessment...' : 'Generating next question...'}
          </p>
        </div>
      </div>
    );
  }

  if (assessmentComplete && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <ButtonSpinner />
          <p className="mt-4 text-lg text-gray-600">Analyzing your responses and generating your personalized report...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assessmentType}</h1>
                <p className="text-gray-600 mt-1">Personalized Career Guidance Assessment</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Question {questionNumber} of 12
                </div>
                <button
                  onClick={handleExitAssessment}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Exit Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((conversationHistory.length / 12) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Progress: {conversationHistory.length}/12 questions completed
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage 
                error={error} 
                type="banner"
                title="Assessment Error"
                onRetry={() => setError('')}
              />
            </div>
          )}

          {/* Question */}
          {currentQuestion && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label 
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={() => handleAnswerSelect(option)}
                      className="mr-3 text-blue-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {!assessmentComplete && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={conversationHistory.length === 0}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  {/* Question indicators */}
                  {Array.from({ length: Math.max(12, conversationHistory.length + 1) }, (_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                        index < conversationHistory.length
                          ? 'bg-green-500 text-white'
                          : index === conversationHistory.length
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <ButtonSpinner />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : conversationHistory.length >= 11 ? (
                    'Finish Assessment'
                  ) : (
                    'Next Question'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Assessment Complete - Get Report Button */}
          {assessmentComplete && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h3>
                  <p className="text-gray-600 mb-6">
                    You've successfully completed all {conversationHistory.length} questions. 
                    Click below to generate your personalized report.
                  </p>
                </div>
                
                <button
                  onClick={handleGetReport}
                  disabled={isLoading}
                  className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <ButtonSpinner />
                      <span className="ml-2">Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Get My Report
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Conversation History Summary */}
          {conversationHistory.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Responses</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {conversationHistory.map((entry, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      Q{entry.questionNumber}: {entry.question}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      A: {entry.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
