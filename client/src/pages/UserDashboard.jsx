import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    userCoupons: [],
    recentTests: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch user coupons and basic stats
      const [couponsResponse] = await Promise.all([
        api.get('/api/user/coupons').catch(() => ({ data: [] }))
      ]);
      
      setDashboardData({
        userCoupons: couponsResponse.data.slice(0, 3), // Show only first 3 coupons
        recentTests: [], // Will be populated later when test functionality is implemented
        stats: {
          totalCoupons: couponsResponse.data.length,
          activeCoupons: couponsResponse.data.filter(c => c.status === 'active').length,
          testsCompleted: 0, // Placeholder
          averageScore: 0 // Placeholder
        }
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">🎫</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">My Coupons</p>
                  <p className="text-2xl font-bold text-blue-900">{dashboardData.stats.totalCoupons}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Coupons</p>
                  <p className="text-2xl font-bold text-green-900">{dashboardData.stats.activeCoupons}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">📝</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tests Completed</p>
                  <p className="text-2xl font-bold text-purple-900">{dashboardData.stats.testsCompleted}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">⭐</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold text-orange-900">{dashboardData.stats.averageScore}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Main Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/assessments')}
                  className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">📚</div>
                    <div className="text-left">
                      <div className="text-lg font-medium">Take Assessment</div>
                      <div className="text-sm text-indigo-200">Practice with available tests</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">👤</div>
                    <div className="text-left">
                      <div className="text-lg font-medium">View Profile</div>
                      <div className="text-sm text-green-200">Manage your account & coupons</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => navigate('/coupons')}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">🎟️</div>
                    <div className="text-left">
                      <div className="text-lg font-medium">Browse Coupons</div>
                      <div className="text-sm text-purple-200">Explore available offers</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Recent Coupons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">My Recent Coupons</h2>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {dashboardData.userCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎫</div>
                  <p className="text-gray-600 mb-4">No coupons available yet</p>
                  <button
                    onClick={() => navigate('/coupons')}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Browse Available Coupons
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.userCoupons.map((coupon) => (
                    <div key={coupon._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{coupon.title || coupon.couponName}</h3>
                          <p className="text-sm text-gray-600">
                            {coupon.discountValue}
                            {coupon.discountType === 'percentage' ? '%' : '$'} OFF
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            coupon.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {coupon.status || 'active'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Expires {formatDate(coupon.expiryDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity / Test History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            
            {dashboardData.recentTests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No test history yet</h3>
                <p className="text-gray-600 mb-6">
                  Start taking assessments to see your progress and performance here.
                </p>
                <button
                  onClick={() => navigate('/assessments')}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Take Your First Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* This will be populated when test functionality is implemented */}
                {dashboardData.recentTests.map((test, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600">Score: {test.score}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(test.completedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Complete your profile to get personalized coupon recommendations
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Take regular assessments to track your learning progress
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Check back frequently for new coupons and special offers
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
