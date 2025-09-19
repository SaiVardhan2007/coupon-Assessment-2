import React from 'react';

const ErrorMessage = ({ 
  error, 
  title = 'Error', 
  onRetry = null, 
  className = '',
  type = 'inline' // 'inline', 'card', 'banner'
}) => {
  if (!error) return null;

  const getMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.statusText) return `${error.response.status}: ${error.response.statusText}`;
    return 'An unexpected error occurred. Please try again.';
  };

  const getIcon = () => (
    <svg 
      className="w-5 h-5 text-red-500 flex-shrink-0" 
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path 
        fillRule="evenodd" 
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
        clipRule="evenodd" 
      />
    </svg>
  );

  if (type === 'banner') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}>
        <div className="flex items-start">
          {getIcon()}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="mt-1 text-sm text-red-700">{getMessage()}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`bg-white border border-red-200 rounded-lg shadow-sm p-6 text-center ${className}`}>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          {getIcon()}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{getMessage()}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Default inline type
  return (
    <div className={`flex items-center space-x-2 text-red-600 text-sm ${className}`}>
      {getIcon()}
      <span>{getMessage()}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-700 hover:text-red-800 underline font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Form Error Component - for form field errors
export const FormError = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <p className={`text-red-600 text-sm mt-1 ${className}`}>
      {typeof error === 'string' ? error : error.message}
    </p>
  );
};

// Toast Error Component - for notification-style errors
export const ToastError = ({ error, onClose, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {typeof error === 'string' ? error : error.message || 'An error occurred'}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
