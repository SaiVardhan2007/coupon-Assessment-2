import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [tests] = useState([
    {
      id: 1,
      title: "Stream Finder",
      description: "Discover the perfect academic stream based on your interests, strengths, and career aspirations.",
      category: "career",
      difficulty: "Personalized",
      duration: "15-20 min",
      questions: "8-10 adaptive",
      topics: ["Academic Interests", "Career Goals", "Strengths Assessment", "Future Planning"],
      icon: "🎯",
      color: "bg-blue-500",
      assessmentType: "Stream Finder"
    },
    {
      id: 2,
      title: "Career Path Explorer",
      description: "Explore various career paths that align with your personality, skills, and interests.",
      category: "career",
      difficulty: "Personalized",
      duration: "20-25 min", 
      questions: "8-10 adaptive",
      topics: ["Personality Assessment", "Skill Evaluation", "Industry Preferences", "Work Environment"],
      icon: "�",
      color: "bg-green-500",
      assessmentType: "Career Path Explorer"
    },
    {
      id: 3,
      title: "Skill Gap Analysis",
      description: "Identify skill gaps and get personalized recommendations for your chosen career path.",
      category: "skill",
      difficulty: "Personalized",
      duration: "15-20 min",
      questions: "8-10 adaptive",
      topics: ["Current Skills", "Target Role Requirements", "Learning Recommendations", "Development Plan"],
      icon: "📈",
      color: "bg-purple-500",
      assessmentType: "Skill Gap Analysis"
    },
    {
      id: 4,
      title: "Personality & Work Style",
      description: "Understand your personality type and discover work environments where you'll thrive.",
      category: "personality",
      difficulty: "Personalized",
      duration: "15-20 min",
      questions: "8-10 adaptive",
      topics: ["Personality Traits", "Work Preferences", "Team Dynamics", "Leadership Style"],
      icon: "🎭",
      color: "bg-red-500",
      assessmentType: "Personality & Work Style"
    },
    {
      id: 5,
      title: "Academic Subject Optimizer",
      description: "Get recommendations for optional subjects and specializations based on your career goals.",
      category: "academic",
      difficulty: "Personalized",
      duration: "15-20 min",
      questions: "8-10 adaptive",
      topics: ["Subject Preferences", "Career Alignment", "Academic Strengths", "Future Requirements"],
      icon: "📚",
      color: "bg-yellow-500",
      assessmentType: "Academic Subject Optimizer"
    },
    {
      id: 6,
      title: "University & Course Finder",
      description: "Discover universities and courses that match your academic profile and career aspirations.",
      category: "education",
      difficulty: "Personalized",
      duration: "20-25 min",
      questions: "8-10 adaptive",
      topics: ["Academic Performance", "Location Preferences", "Course Requirements", "Career Goals"],
      icon: "�",
      color: "bg-indigo-500",
      assessmentType: "University & Course Finder"
    },
    {
      id: 7,
      title: "Entrepreneurship Readiness",
      description: "Assess your entrepreneurial potential and get guidance on starting your own venture.",
      category: "entrepreneurship",
      difficulty: "Personalized",
      duration: "20-25 min",
      questions: "8-10 adaptive",
      topics: ["Risk Tolerance", "Innovation Mindset", "Leadership Skills", "Business Acumen"],
      icon: "�",
      color: "bg-teal-500",
      assessmentType: "Entrepreneurship Readiness"
    },
    {
      id: 8,
      title: "Industry Trends & Future Skills",
      description: "Stay ahead with insights on industry trends and future skill requirements.",
      category: "trends",
      difficulty: "Personalized",
      duration: "15-20 min",
      questions: "8-10 adaptive",
      topics: ["Industry Analysis", "Future Skills", "Technology Trends", "Market Demands"],
      icon: "�",
      color: "bg-cyan-500",
      assessmentType: "Industry Trends & Future Skills"
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Assessments', icon: '📋' },
    { value: 'career', label: 'Career Guidance', icon: '🚀' },
    { value: 'skill', label: 'Skill Assessment', icon: '�' },
    { value: 'personality', label: 'Personality', icon: '🎭' },
    { value: 'academic', label: 'Academic Planning', icon: '📚' },
    { value: 'education', label: 'Education Path', icon: '�' },
    { value: 'entrepreneurship', label: 'Entrepreneurship', icon: '💡' },
    { value: 'trends', label: 'Future Trends', icon: '�' }
  ];

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800',
    'Personalized': 'bg-blue-100 text-blue-800'
  };

  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAttemptTest = (test) => {
    console.log('handleAttemptTest called with test:', test);
    console.log('Current showCouponModal state before:', showCouponModal);
    
    setCouponCode('');
    setCouponError('');
    setIsRedeeming(false);
    
    setSelectedTest(test);
    setShowCouponModal(true);
    
    console.log('Modal state set to true');
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon name');
      return;
    }

    setIsRedeeming(true);
    setCouponError('');

    try {
      const response = await api.post('/api/user/coupons/redeem', {
        couponName: couponCode.trim()
      });

      navigate('/exam', {
        state: {
          assessmentType: selectedTest.assessmentType,
          testInfo: selectedTest,
          redemptionDetails: response.data
        }
      });
      
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      
      let errorMessage = 'Failed to redeem coupon. Please try again.';
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        
        // Customize error messages for better user experience
        if (message.includes('already used')) {
          errorMessage = '🚫 You have already used this coupon. Each coupon can only be used once per user.';
        } else if (message.includes('expired')) {
          errorMessage = '⏰ This coupon has expired and can no longer be used.';
        } else if (message.includes('not active')) {
          errorMessage = '❌ This coupon is currently inactive.';
        } else if (message.includes('not authorized')) {
          errorMessage = '🔒 You are not authorized to use this coupon. Please check if it\'s assigned to you.';
        } else if (message.includes('usage limit')) {
          errorMessage = '📊 This coupon has reached its usage limit and can no longer be used.';
        } else if (message.includes('not found')) {
          errorMessage = '❓ Coupon not found. Please check the coupon name and try again.';
        } else {
          errorMessage = message;
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setCouponError(errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const closeCouponModal = () => {
    setShowCouponModal(false);
    setSelectedTest(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleBypassCoupon = () => {
    navigate('/exam', {
      state: {
        assessmentType: selectedTest.assessmentType,
        testInfo: selectedTest,
        redemptionDetails: {
          message: 'Test mode - coupon bypassed',
          redemption: {
            coupon: { name: 'TEST_MODE' },
            user: { name: user?.name || 'Test User' }
          }
        }
      }
    });
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <LoadingSpinner text="Preparing your assessment..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mr-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📚 Assessment Center
            </h1>
            <p className="text-lg text-gray-600">
              Choose from our comprehensive collection of tests to assess your knowledge and skills.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search tests by title, description, or topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredTests.length} of {tests.length} tests
                {selectedCategory !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                    {categories.find(c => c.value === selectedCategory)?.label}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or selected category.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Test Header */}
                  <div className={`${test.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{test.icon}</div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        difficultyColors[test.difficulty]
                      } bg-white bg-opacity-90`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                    <p className="text-sm opacity-90">{test.description}</p>
                  </div>

                  {/* Test Details */}
                  <div className="p-6">
                    {/* Test Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {test.duration} mins
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {test.questions} questions
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Topics covered:</h4>
                      <div className="flex flex-wrap gap-1">
                        {test.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAttemptTest(test)}
                      className={`w-full ${test.color} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Attempt Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">📋 Assessment Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Before You Start:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet environment for concentration</li>
                  <li>• Have a pen and paper ready for calculations</li>
                  <li>• Review the test duration and plan accordingly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">During the Test:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Read each question carefully before answering</li>
                  <li>• You can navigate back to previous questions</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• Submit before the time limit expires</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These assessments are designed to help you evaluate your knowledge and identify areas for improvement. 
                Take your time and do your best! 🌟
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Code Modal */}
      {showCouponModal && selectedTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeCouponModal}
            ></div>
            
            {/* Modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-10">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                    Enter Coupon Name
                  </h3>
                  {selectedTest && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{selectedTest.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{selectedTest.title}</div>
                          <div className="text-sm text-gray-600">{selectedTest.difficulty} • {selectedTest.duration} minutes</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Please enter your coupon name to proceed with the assessment.
                  </p>
                  
                  <form onSubmit={handleCouponSubmit}>
                    <div className="mb-4">
                      <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Name
                      </label>
                      <input
                        type="text"
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter your coupon name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isRedeeming}
                        autoFocus
                      />
                    </div>
                    
                    {couponError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700">{couponError}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={isRedeeming}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRedeeming ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Redeeming...
                          </>
                        ) : (
                          'Start Assessment'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeCouponModal}
                        disabled={isRedeeming}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
