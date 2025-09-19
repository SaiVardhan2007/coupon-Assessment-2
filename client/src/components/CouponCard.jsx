import React from 'react';

const CouponCard = ({ 
  coupon, 
  onEdit, 
  onDelete, 
  onRedeem, 
  showActions = true,
  isAdmin = false 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const isExpired = new Date(coupon.expiryDate) < new Date();
  const isUsed = coupon.usageCount >= coupon.usageLimit;
  const canRedeem = !isExpired && !isUsed && coupon.status === 'active';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {coupon.title || coupon.code}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {coupon.description}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
            </span>
            <span className="text-sm text-gray-500">OFF</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
            {coupon.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Code:</span>
          <span className="font-mono font-medium">{coupon.code}</span>
        </div>
        <div className="flex justify-between">
          <span>Expires:</span>
          <span>{formatDate(coupon.expiryDate)}</span>
        </div>
        <div className="flex justify-between">
          <span>Usage:</span>
          <span>{coupon.usageCount}/{coupon.usageLimit}</span>
        </div>
        {coupon.minimumOrderValue && (
          <div className="flex justify-between">
            <span>Min. Order:</span>
            <span>${coupon.minimumOrderValue}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex space-x-2">
          {!isAdmin && canRedeem && (
            <button
              onClick={() => onRedeem && onRedeem(coupon)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Redeem
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit && onEdit(coupon)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(coupon)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {!canRedeem && !isAdmin && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">
            {isExpired ? 'Expired' : isUsed ? 'Usage limit reached' : 'Not available'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CouponCard;
