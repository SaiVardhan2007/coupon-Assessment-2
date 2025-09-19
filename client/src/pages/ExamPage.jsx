import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ExamPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Get test info and coupon redemption details from location state
  const testInfo = location.state?.testInfo;
  const redemptionDetails = location.state?.redemptionDetails;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock exam questions - this would come from an API in a real application
  const [examQuestions] = useState([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      id: 2,
      question: "Which of the following is a prime number?",
      options: ["4", "6", "9", "7"],
      correctAnswer: 3
    },
    {
      id: 3,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 2
    }
  ]);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0 && !examCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining, examCompleted]);

  // Initialize timer when exam starts
  const startExam = () => {
    const duration = testInfo?.duration || 30; // Default 30 minutes
    setTimeRemaining(duration * 60); // Convert to seconds
    setExamStarted(true);
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit exam
  const handleSubmitExam = async () => {
    setLoading(true);
    setExamCompleted(true);

    // Calculate score
    let correctAnswers = 0;
    examQuestions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / examQuestions.length) * 100);

    // In a real application, you would submit results to the backend
    setTimeout(() => {
      setLoading(false);
      navigate('/exam/results', {
        state: {
          score,
          correctAnswers,
          totalQuestions: examQuestions.length,
          testInfo,
          redemptionDetails,
          answers,
          examQuestions
        }
      });
    }, 2000);
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // If no test info, redirect to assessments
  if (!testInfo) {
    navigate('/assessments');
    return null;
  }

  if (loading) {
    return <LoadingSpinner text="Processing your exam results..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {!examStarted ? (
            // Pre-exam screen
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{testInfo.icon}</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {testInfo.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  {testInfo.description}
                </p>
              </div>

              {/* Coupon Redemption Success */}
              {redemptionDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">✅</div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Coupon Redeemed Successfully!
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Coupon:</span>{' '}
                      <span className="text-green-700">{redemptionDetails.coupon.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Discount:</span>{' '}
                      <span className="text-green-700">
                        {redemptionDetails.coupon.discountValue}
                        {redemptionDetails.coupon.discountType === 'percentage' ? '%' : '$'} OFF
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-900">{testInfo.duration}</div>
                  <div className="text-sm text-blue-700">Minutes</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-900">{examQuestions.length}</div>
                  <div className="text-sm text-purple-700">Questions</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-900">{testInfo.difficulty}</div>
                  <div className="text-sm text-orange-700">Difficulty</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">📋 Exam Instructions</h3>
                <ul className="text-yellow-800 space-y-2">
                  <li>• You have {testInfo.duration} minutes to complete the exam</li>
                  <li>• You can navigate between questions using the navigation buttons</li>
                  <li>• Your answers are automatically saved as you progress</li>
                  <li>• Make sure to submit your exam before time runs out</li>
                  <li>• Once submitted, you cannot modify your answers</li>
                </ul>
              </div>

              {/* Start Exam Button */}
              <div className="text-center">
                <button
                  onClick={startExam}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Start Exam
                </button>
              </div>
            </div>
          ) : (
            // Exam interface
            <div className="bg-white rounded-lg shadow-md">
              {/* Exam Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{testInfo.title}</h1>
                    <p className="text-gray-600">
                      Question {currentQuestion + 1} of {examQuestions.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-red-600">
                      ⏰ {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-500">Time Remaining</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / examQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    {examQuestions[currentQuestion].question}
                  </h2>
                  
                  <div className="space-y-3">
                    {examQuestions[currentQuestion].options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[examQuestions[currentQuestion].id] === index
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${examQuestions[currentQuestion].id}`}
                          value={index}
                          checked={answers[examQuestions[currentQuestion].id] === index}
                          onChange={() => handleAnswerChange(examQuestions[currentQuestion].id, index)}
                          className="mr-4 h-4 w-4 text-indigo-600"
                        />
                        <span className="text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="text-sm text-gray-500">
                    {Object.keys(answers).length} of {examQuestions.length} answered
                  </div>

                  {currentQuestion === examQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
