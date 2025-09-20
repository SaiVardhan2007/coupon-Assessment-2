import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ReportPage = () => {
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
          error: 'No assessment report found. Please complete an assessment first.'
        }
      });
    }
  }, [location.state, navigate]);

  const handleRetakeAssessment = () => {
    navigate('/assessments');
  };

  const handleReturnToDashboard = () => {
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Enhanced report parsing for better formatting
  const parseReport = (reportText) => {
    if (!reportText) return [];
    
    const sections = reportText.split('\n\n');
    return sections.map(section => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      // Check if section starts with a heading pattern (e.g., "1. " or "SECTION:")
      const isHeading = /^(\d+\.\s|[A-Z\s]+:|\*\*.*\*\*|#{1,6}\s)/.test(trimmedSection);
      
      // Check if section contains bullet points
      const hasBulletPoints = /^[-•*]\s/m.test(trimmedSection);
      
      // Check if section contains numbered lists
      const hasNumberedList = /^\d+\.\s/m.test(trimmedSection);
      
      return {
        content: trimmedSection,
        isHeading,
        hasBulletPoints,
        hasNumberedList,
        type: isHeading ? 'heading' : hasBulletPoints ? 'bulletList' : hasNumberedList ? 'numberedList' : 'paragraph'
      };
    }).filter(Boolean);
  };

  const formatBulletPoints = (content) => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        return (
          <li key={index} className="text-gray-700 leading-relaxed">
            {trimmedLine.substring(1).trim()}
          </li>
        );
      }
      return trimmedLine ? (
        <p key={index} className="text-gray-700 leading-relaxed mb-2">
          {trimmedLine}
        </p>
      ) : null;
    }).filter(Boolean);
  };

  const formatNumberedList = (content) => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s(.+)/);
      if (numberedMatch) {
        return (
          <li key={index} className="text-gray-700 leading-relaxed mb-2">
            {numberedMatch[2]}
          </li>
        );
      }
      return trimmedLine ? (
        <p key={index} className="text-gray-700 leading-relaxed mb-2">
          {trimmedLine}
        </p>
      ) : null;
    }).filter(Boolean);
  };

  const reportSections = parseReport(report);

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Report Found</h2>
          <p className="text-gray-600 mb-6">Please complete an assessment to view your report.</p>
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-md p-6 mb-6 print:bg-white print:text-black print:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <svg className="w-8 h-8 mr-3 print:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <h1 className="text-3xl font-bold">
                    Assessment Report
                  </h1>
                </div>
                <p className="text-lg text-blue-100 print:text-gray-600 mb-1">{assessmentType}</p>
                <p className="text-sm text-blue-200 print:text-gray-500">
                  Completed on {new Date().toLocaleDateString()} by {userDetails.name || user?.name}
                </p>
              </div>
              <div className="flex space-x-3 print:hidden">
                <button
                  onClick={handlePrintReport}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">
              Your Personalized Assessment Report
            </h2>
            <div className="prose max-w-none">
              {reportSections.map((section, index) => (
                <div key={index} className="mb-6">
                  {section.type === 'heading' && (
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 text-blue-700 border-l-4 border-blue-500 pl-4">
                        {section.content.replace(/^(\d+\.\s|[*#]+\s)/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                      </h3>
                    </div>
                  )}
                  
                  {section.type === 'bulletList' && (
                    <div className="mb-4">
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        {formatBulletPoints(section.content)}
                      </ul>
                    </div>
                  )}
                  
                  {section.type === 'numberedList' && (
                    <div className="mb-4">
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        {formatNumberedList(section.content)}
                      </ol>
                    </div>
                  )}
                  
                  {section.type === 'paragraph' && (
                    <div className="mb-4">
                      {section.content.includes(':') ? (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            {section.content.split(':')[0]}:
                          </h4>
                          <p className="text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-200">
                            {section.content.split(':').slice(1).join(':').trim()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {section.content}
                        </p>
                      )}
                    </div>
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
                onClick={handleReturnToDashboard}
                className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
                </svg>
                Return to Dashboard
              </button>
              <button
                onClick={handleRetakeAssessment}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Take Another Assessment
              </button>
              <button
                onClick={handlePrintReport}
                className="bg-gray-600 text-white px-8 py-3 rounded-md hover:bg-gray-700 font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
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

export default ReportPage;
