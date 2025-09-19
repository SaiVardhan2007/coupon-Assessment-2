import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const CouponDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    if (isAdmin && id) {
      fetchCouponDetails();
    }
  }, [isAdmin, id]);

  const fetchCouponDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/admin/coupons/${id}`);
      setCoupon(response.data);
    } catch (err) {
      console.error('Error fetching coupon details:', err);
      if (err.response?.status === 404) {
        setError('Coupon not found');
      } else if (err.response?.status === 400) {
        setError('Invalid coupon ID');
      } else {
        setError('Failed to fetch coupon details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggleLoading(true);
      const response = await api.put(`/api/admin/coupons/toggle/${id}`);
      setCoupon(prev => ({
        ...prev,
        isActive: response.data.coupon.isActive
      }));
    } catch (err) {
      console.error('Error toggling coupon status:', err);
      setError('Failed to update coupon status. Please try again.');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/admin/dashboard', { state: { activeTab: 'coupons' } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  if (loading) {
    return <LoadingSpinner text="Loading coupon details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleGoBack}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return null;
  }

  const isExpired = new Date(coupon.expiryDate) < new Date();
  const usagePercentage = coupon.maxUses > 0 ? (coupon.usageCount / coupon.maxUses) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {coupon.couponName}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    coupon.type === 'specific' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {coupon.type === 'specific' ? 'Specific Users' : 'General Coupon'}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    coupon.isActive
                      ? isExpired
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {coupon.isActive 
                      ? isExpired 
                        ? 'Expired' 
                        : 'Active'
                      : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleToggleStatus}
                disabled={toggleLoading}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  coupon.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {toggleLoading 
                  ? 'Updating...' 
                  : coupon.isActive 
                    ? 'Deactivate Coupon' 
                    : 'Activate Coupon'
                }
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    <div className="text-2xl font-bold text-indigo-600">
                      {coupon.discountValue}
                      {coupon.discountType === 'percentage' ? '%' : '$'}
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        {coupon.discountType === 'percentage' ? 'OFF' : 'DISCOUNT'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900">{coupon.type === 'specific' ? 'Specific Users' : 'General'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-900">{formatDate(coupon.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires</label>
                    <p className={`${isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(coupon.expiryDate)}
                      {isExpired && ' (Expired)'}
                    </p>
                  </div>
                  
                  {coupon.createdBy && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                      <p className="text-gray-900">{coupon.createdBy.name} ({coupon.createdBy.email})</p>
                    </div>
                  )}
                  
                  {coupon.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-gray-900">{coupon.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{coupon.usageCount}</div>
                    <div className="text-sm text-gray-600">Times Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{coupon.maxUses}</div>
                    <div className="text-sm text-gray-600">Max Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.max(0, coupon.maxUses - coupon.usageCount)}
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
                
                {/* Usage Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Usage Progress</span>
                    <span>{usagePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        usagePercentage >= 100 
                          ? 'bg-red-500' 
                          : usagePercentage >= 75 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Usage History */}
              {coupon.usedBy && coupon.usedBy.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Usage History ({coupon.usedBy.length})
                  </h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {coupon.usedBy.map((usage, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {usage.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {usage.user?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {usage.user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{formatDateShort(usage.usedAt)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(usage.usedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assigned Users (for specific coupons) */}
              {coupon.type === 'specific' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Assigned Users ({coupon.assignedUsers?.length || 0})
                  </h2>
                  {coupon.assignedUsers && coupon.assignedUsers.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {coupon.assignedUsers.map((user) => (
                        <div key={user._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500">{user.phone}</p>
                            )}
                            {user.city && user.currentStudies && (
                              <p className="text-xs text-gray-500">
                                Grade {user.currentStudies}, {user.city}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No users assigned</p>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleToggleStatus}
                    disabled={toggleLoading}
                    className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                      coupon.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {toggleLoading 
                      ? 'Updating...' 
                      : coupon.isActive 
                        ? 'Deactivate' 
                        : 'Activate'
                    }
                  </button>
                  
                  <button
                    onClick={() => navigate('/admin/create-coupon')}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create New Coupon
                  </button>
                  
                  <button
                    onClick={handleGoBack}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      coupon.isActive
                        ? isExpired
                          ? 'text-yellow-600'
                          : 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {coupon.isActive 
                        ? isExpired 
                          ? 'Expired' 
                          : 'Active'
                        : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usage Rate:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Days Left:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {isExpired 
                        ? 'Expired' 
                        : Math.max(0, Math.ceil((new Date(coupon.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))
                      }
                    </span>
                  </div>
                  
                  {coupon.type === 'specific' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {coupon.assignedUsers?.length || 0} users
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailsPage;
