import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ExamResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get data from navigation state
  const {
    assessmentType,
    conversationHistory = [],
    report = '',
    userDetails = {}
  } = location.state || {};

  // Redirect if no data provided
  React.useEffect(() => {
    if (!location.state?.report) {
      navigate('/assessments', {
        replace: true,
        state: {
          error: 'No assessment results found. Please complete an assessment first.'
        }
      });
    }
  }, [location.state, navigate]);

  const handleRetakeAssessment = () => {
    navigate('/assessments');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Parse report sections if it's structured
  const parseReport = (reportText) => {
    const sections = reportText.split('\n\n');
    return sections.map(section => section.trim()).filter(section => section.length > 0);
  };

  const reportSections = parseReport(report);

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6">Please complete an assessment to view your results.</p>
          <button
            onClick={() => navigate('/assessments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Assessment Results
                </h1>
                <p className="text-lg text-gray-600 mb-1">{assessmentType}</p>
                <p className="text-sm text-gray-500">
                  Completed on {new Date().toLocaleDateString()} by {userDetails.name || user?.name}
                </p>
              </div>
              <div className="flex space-x-3 print:hidden">
                <button
                  onClick={handlePrintReport}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                >
                  Print Report
                </button>
                <button
                  onClick={handleRetakeAssessment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Retake Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Assessment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Assessment Type</h3>
                <p className="text-blue-700">{assessmentType}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Questions Answered</h3>
                <p className="text-green-700">{conversationHistory.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Completion Status</h3>
                <p className="text-purple-700">Complete</p>
              </div>
            </div>
          </div>

          {/* Detailed Report */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Personalized Report</h2>
            <div className="prose max-w-none">
              {reportSections.map((section, index) => (
                <div key={index} className="mb-6">
                  {section.includes(':') ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {section.split(':')[0]}:
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {section.split(':').slice(1).join(':').trim()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{section}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Your Responses */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Responses</h2>
            <div className="space-y-4">
              {conversationHistory.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Question {entry.questionNumber}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {entry.question}
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Your Answer: {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 print:hidden">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetakeAssessment}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Take Another Assessment
              </button>
              <button
                onClick={handleBackToHome}
                className="bg-gray-600 text-white px-8 py-3 rounded-md hover:bg-gray-700 font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              This assessment was generated using AI technology to provide personalized career guidance.
              Results are based on your responses and should be considered as guidance rather than definitive career advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
