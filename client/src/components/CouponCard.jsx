import React from 'react';

const CouponCard = ({ 
  coupon, 
  onToggleStatus,
  onViewDetails,
  isToggling = false,
  showActions = true,
  isAdmin = false 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    if (!coupon.isActive) {
      return 'bg-gray-100 text-gray-800';
    }
    const isExpired = new Date(coupon.expiryDate) < new Date();
    if (isExpired) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!coupon.isActive) {
      return 'INACTIVE';
    }
    const isExpired = new Date(coupon.expiryDate) < new Date();
    if (isExpired) {
      return 'EXPIRED';
    }
    return 'ACTIVE';
  };

  const getCouponTypeIcon = () => {
    return coupon.type === 'specific' ? '👥' : '🌐';
  };

  const getTypeDisplayName = () => {
    return coupon.type === 'specific' ? 'Specific' : 'General';
  };

  const isExpired = new Date(coupon.expiryDate) < new Date();
  const isUsedUp = coupon.type === 'general' && coupon.usageCount >= coupon.maxUses;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCouponTypeIcon()}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {coupon.couponName}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getTypeDisplayName()}
              </span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-3 mb-4">
          {/* Usage Information */}
          {coupon.type === 'general' ? (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Usage:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {coupon.usageCount || 0} / {coupon.maxUses}
                </span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((coupon.usageCount || 0) / coupon.maxUses * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assigned Users:</span>
                <span className="text-sm font-medium text-gray-900">
                  {coupon.assignedUsers?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Used By:</span>
                <span className="text-sm font-medium text-gray-900">
                  {coupon.usedBy?.length || 0}
                </span>
              </div>
            </>
          )}

          {/* Expiry Date */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Expires:</span>
            <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(coupon.expiryDate)}
            </span>
          </div>

          {/* Created Date */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Created:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(coupon.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && isAdmin && (
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(coupon._id)}
                disabled={isToggling}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  coupon.isActive 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isToggling ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </div>
                ) : (
                  coupon.isActive ? 'Deactivate' : 'Activate'
                )}
              </button>
            )}
            
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(coupon._id)}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                View Details
              </button>
            )}
          </div>
        )}

        {/* Status Indicators for Non-Admin */}
        {!isAdmin && (
          <div className="pt-4 border-t border-gray-100">
            {isExpired ? (
              <div className="text-center text-sm text-red-600">
                This coupon has expired
              </div>
            ) : !coupon.isActive ? (
              <div className="text-center text-sm text-gray-600">
                This coupon is inactive
              </div>
            ) : isUsedUp ? (
              <div className="text-center text-sm text-orange-600">
                Usage limit reached
              </div>
            ) : (
              <div className="text-center text-sm text-green-600">
                Available for use
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCard;
