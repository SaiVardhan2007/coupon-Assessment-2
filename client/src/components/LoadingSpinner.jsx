import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = '', 
  overlay = false,
  fullPage = false,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-gray-600';
      case 'green':
        return 'border-green-300 border-t-green-600';
      case 'red':
        return 'border-red-300 border-t-red-600';
      case 'yellow':
        return 'border-yellow-300 border-t-yellow-600';
      case 'indigo':
        return 'border-indigo-300 border-t-indigo-600';
      default:
        return 'border-blue-300 border-t-blue-600';
    }
  };

  const getContainerClasses = () => {
    if (fullPage) return 'min-h-screen flex flex-col items-center justify-center';
    if (overlay) return 'flex items-center justify-center flex-col';
    return 'flex items-center justify-center';
  };

  const spinner = (
    <div className={`${getContainerClasses()} ${className}`}>
      <div
        className={`
          ${getSizeClasses()} 
          ${getColorClasses()}
          border-2 
          border-solid 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <span className={`
          text-gray-600 
          font-medium 
          ${fullPage || overlay ? 'mt-3 text-center text-lg' : size === 'small' ? 'ml-2 text-sm' : 'ml-3'}
        `}>
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Button Loading Spinner - for inline button usage
export const ButtonSpinner = ({ size = 'small', color = 'white' }) => (
  <LoadingSpinner size={size} color={color} />
);

// Page Loading Spinner - for full page loading
export const PageSpinner = ({ text = 'Loading...' }) => (
  <LoadingSpinner size="xl" text={text} fullPage={true} color="indigo" />
);

// Overlay Loading Spinner - for modal/overlay loading
export const OverlaySpinner = ({ text = 'Processing...' }) => (
  <LoadingSpinner overlay={true} size="large" text={text} color="indigo" />
);

// Inline Loading Spinner - for small inline elements
export const InlineSpinner = ({ text = '', color = 'blue' }) => (
  <LoadingSpinner size="small" color={color} text={text} />
);

// Card Loading Spinner - for content areas
export const CardSpinner = ({ text = 'Loading...', className = '' }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <LoadingSpinner size="large" text={text} color="indigo" />
  </div>
);

export default LoadingSpinner;
