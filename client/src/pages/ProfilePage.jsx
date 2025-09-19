import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CouponCard from '../components/CouponCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [userCoupons, setUserCoupons] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [couponsResponse, historyResponse] = await Promise.all([
        api.get('/api/user/coupons'),
        api.get('/api/user/usage-history')
      ]);
      
      setUserCoupons(couponsResponse.data);
      setUsageHistory(historyResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch user data. Please try again.');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'used':
        return 'text-gray-600 bg-gray-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {user?.username || 'User'}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="font-medium">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'coupons'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Coupons ({userCoupons.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'history'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Usage History ({usageHistory.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Role</label>
                          <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Member Since</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(user?.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Coupons:</span>
                          <span className="text-sm font-medium text-gray-900">{userCoupons.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active Coupons:</span>
                          <span className="text-sm font-medium text-green-600">
                            {userCoupons.filter(c => c.status === 'active' && new Date(c.expiryDate) > new Date()).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Used Coupons:</span>
                          <span className="text-sm font-medium text-gray-600">{usageHistory.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expired Coupons:</span>
                          <span className="text-sm font-medium text-red-600">
                            {userCoupons.filter(c => new Date(c.expiryDate) < new Date()).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={logout}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Coupons Tab */}
              {activeTab === 'coupons' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">My Coupons</h3>
                  {userCoupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userCoupons.map((coupon) => (
                        <CouponCard
                          key={coupon._id}
                          coupon={coupon}
                          showActions={false}
                          isAdmin={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎫</div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">No coupons yet</h4>
                      <p className="text-gray-500">You haven't been assigned any coupons yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Usage History</h3>
                  {usageHistory.length > 0 ? (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Coupon
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Discount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Used Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {usageHistory.map((usage, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {usage.coupon?.title || usage.couponCode}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {usage.coupon?.code || usage.couponCode}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {usage.coupon?.discountType === 'percentage' 
                                  ? `${usage.coupon?.discountValue}%` 
                                  : `$${usage.coupon?.discountValue}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(usage.usedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('used')}`}>
                                  Used
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📊</div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">No usage history</h4>
                      <p className="text-gray-500">You haven't used any coupons yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
