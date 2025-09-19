import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ExamResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Get results from location state
  const {
    score,
    correctAnswers,
    totalQuestions,
    testInfo,
    redemptionDetails,
    answers,
    examQuestions
  } = location.state || {};

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // If no results data, redirect to assessments
  if (!score && score !== 0) {
    navigate('/assessments');
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { text: 'Excellent!', color: 'bg-green-100 text-green-800', icon: '🌟' };
    if (score >= 80) return { text: 'Great Job!', color: 'bg-blue-100 text-blue-800', icon: '🎉' };
    if (score >= 70) return { text: 'Good Work!', color: 'bg-yellow-100 text-yellow-800', icon: '👍' };
    if (score >= 60) return { text: 'Fair', color: 'bg-orange-100 text-orange-800', icon: '📈' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800', icon: '📚' };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">{testInfo?.icon || '📝'}</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Exam Completed!
              </h1>
              <h2 className="text-xl text-gray-600 mb-6">
                {testInfo?.title}
              </h2>

              {/* Score Display */}
              <div className="bg-gray-50 rounded-lg p-8 mb-6">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
                  <span className="mr-2">{badge.icon}</span>
                  {badge.text}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{correctAnswers}</div>
                  <div className="text-sm text-blue-700">Correct Answers</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{totalQuestions - correctAnswers}</div>
                  <div className="text-sm text-purple-700">Incorrect Answers</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{totalQuestions}</div>
                  <div className="text-sm text-green-700">Total Questions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Redemption Details */}
          {redemptionDetails && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💰 Coupon Benefits Applied
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-green-800">Coupon Used:</span>{' '}
                    <span className="text-green-700">{redemptionDetails.coupon.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Discount Applied:</span>{' '}
                    <span className="text-green-700">
                      {redemptionDetails.coupon.discountValue}
                      {redemptionDetails.coupon.discountType === 'percentage' ? '%' : '$'} OFF
                    </span>
                  </div>
                </div>
                {redemptionDetails.coupon.description && (
                  <div className="mt-2">
                    <span className="font-medium text-green-800">Description:</span>{' '}
                    <span className="text-green-700">{redemptionDetails.coupon.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Review */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              📋 Answer Review
            </h3>
            
            <div className="space-y-6">
              {examQuestions?.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Question {index + 1}: {question.question}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Your Answer:</span>{' '}
                        <span className={userAnswer !== undefined ? (isCorrect ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}>
                          {userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer:</span>{' '}
                        <span className="text-green-600">
                          {question.options[question.correctAnswer]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/assessments')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Take Another Assessment
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Recommendations</h3>
            <div className="text-blue-800">
              {score >= 80 ? (
                <p>Excellent work! You've demonstrated strong understanding of the subject. Consider taking more advanced assessments to further challenge yourself.</p>
              ) : score >= 60 ? (
                <p>Good effort! You have a solid foundation. Review the questions you missed and consider additional practice in those areas.</p>
              ) : (
                <p>Keep practicing! Focus on the fundamental concepts and consider reviewing study materials before retaking the assessment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResultsPage;
