import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner, InlineSpinner, ButtonSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [couponStats, setCouponStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({}); // For individual coupon toggle loading states

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'users') {
        const [usersResponse, statsResponse] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/users/stats')
        ]);
        setUsers(usersResponse.data);
        setUserStats(statsResponse.data);
      } else if (activeTab === 'coupons') {
        const [couponsResponse, statsResponse] = await Promise.all([
          api.get('/api/admin/coupons'),
          api.get('/api/admin/coupons/stats')
        ]);
        setCoupons(couponsResponse.data);
        setCouponStats(statsResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/users/${userId}`, updates);
      await fetchData(); // Refresh data
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (err) {
      alert('Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/api/admin/users/${deletingUser._id}`);
      await fetchData(); // Refresh data
      setDeletingUser(null);
      alert('User deleted successfully!');
    } catch (err) {
      alert('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCouponStatus = async (couponId) => {
    try {
      setToggleLoading(prev => ({ ...prev, [couponId]: true }));
      
      const response = await api.put(`/api/admin/coupons/toggle/${couponId}`);
      
      // Update the coupon in the local state
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => 
          coupon._id === couponId 
            ? { ...coupon, isActive: response.data.coupon.isActive }
            : coupon
        )
      );
      
      // Show success message (you can implement a toast notification here)
      console.log(response.data.message);
      
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      setError('Failed to update coupon status. Please try again.');
    } finally {
      setToggleLoading(prev => ({ ...prev, [couponId]: false }));
    }
  };

  const handleViewCouponDetails = (couponId) => {
    navigate(`/admin/coupon-details/${couponId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageSpinner text="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage users and monitor system activity
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    Users ({Object.keys(userStats).length > 0 ? userStats.totalUsers : users.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'coupons'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Coupons ({Object.keys(couponStats).length > 0 ? couponStats.totalCoupons : coupons.length})
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  {/* User Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">👥</div>
                        <div>
                          <p className="text-sm font-medium text-blue-500">Total Users</p>
                          <p className="text-2xl font-bold text-blue-900">{userStats.totalUsers || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">✅</div>
                        <div>
                          <p className="text-sm font-medium text-green-500">Active Users</p>
                          <p className="text-2xl font-bold text-green-900">{userStats.activeUsers || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">👑</div>
                        <div>
                          <p className="text-sm font-medium text-purple-500">Admin Users</p>
                          <p className="text-2xl font-bold text-purple-900">{userStats.adminUsers || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">📅</div>
                        <div>
                          <p className="text-sm font-medium text-orange-500">New This Month</p>
                          <p className="text-2xl font-bold text-orange-900">{userStats.newUsersThisMonth || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Education
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role & Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Coupons
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((userData) => (
                            <tr key={userData._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {userData.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {userData.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {userData._id.slice(-6)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{userData.email}</div>
                                <div className="text-sm text-gray-500">{userData.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Grade {userData.currentStudies}</div>
                                <div className="text-sm text-gray-500">{userData.city}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userData.role)}`}>
                                    {userData.role}
                                  </span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(userData.isActive)}`}>
                                    {userData.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex flex-col space-y-1">
                                  <span>Total: {userData.stats?.totalCoupons || 0}</span>
                                  <span className="text-green-600">Active: {userData.stats?.activeCoupons || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(userData.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setEditingUser(userData)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </button>
                                  {userData.role !== 'admin' && (
                                    <button
                                      onClick={() => setDeletingUser(userData)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupons Tab */}
              {activeTab === 'coupons' && (
                <div>
                  {/* Coupon Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">🎫</div>
                        <div>
                          <p className="text-sm font-medium text-blue-500">Total Coupons</p>
                          <p className="text-2xl font-bold text-blue-900">{couponStats.totalCoupons || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">✅</div>
                        <div>
                          <p className="text-sm font-medium text-green-500">Active Coupons</p>
                          <p className="text-2xl font-bold text-green-900">{couponStats.activeCoupons || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">❌</div>
                        <div>
                          <p className="text-sm font-medium text-red-500">Expired Coupons</p>
                          <p className="text-2xl font-bold text-red-900">{couponStats.expiredCoupons || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">📊</div>
                        <div>
                          <p className="text-sm font-medium text-purple-500">Total Usage</p>
                          <p className="text-2xl font-bold text-purple-900">{couponStats.totalUsage || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Management Actions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">
                      Coupon Management
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Create new coupons and manage existing ones.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate('/admin/create-coupon')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Coupon
                      </button>
                    </div>
                  </div>

                  {/* Active Coupons Section */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">✅</div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Active Coupons ({coupons.filter(c => c.isActive).length})
                      </h3>
                    </div>
                    
                    {coupons.filter(coupon => coupon.isActive).length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <div className="text-4xl mb-2">🎫</div>
                        <p className="text-gray-600">No active coupons found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.filter(coupon => coupon.isActive).map((coupon) => (
                          <CouponCard 
                            key={coupon._id} 
                            coupon={coupon} 
                            onToggleStatus={handleToggleCouponStatus}
                            onViewDetails={handleViewCouponDetails}
                            isToggling={toggleLoading[coupon._id]}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inactive Coupons Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">❌</div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Inactive Coupons ({coupons.filter(c => !c.isActive).length})
                      </h3>
                    </div>
                    
                    {coupons.filter(coupon => !coupon.isActive).length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <div className="text-4xl mb-2">💤</div>
                        <p className="text-gray-600">No inactive coupons found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.filter(coupon => !coupon.isActive).map((coupon) => (
                          <CouponCard 
                            key={coupon._id} 
                            coupon={coupon} 
                            onToggleStatus={handleToggleCouponStatus}
                            onViewDetails={handleViewCouponDetails}
                            isToggling={toggleLoading[coupon._id]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
          isLoading={actionLoading}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};

// User Edit Modal Component
const UserEditModal = ({ user, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit User</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active User
              </label>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// CouponCard Component
const CouponCard = ({ coupon, onToggleStatus, onViewDetails, isToggling }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = new Date(coupon.expiryDate) < new Date();
  const usagePercentage = coupon.type === 'general' && coupon.maxUses > 0 
    ? (coupon.usageCount / coupon.maxUses) * 100 
    : 0;

  const getCouponTypeIcon = () => {
    return coupon.type === 'specific' ? '👥' : '🌐';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${
      coupon.isActive 
        ? isExpired 
          ? 'border-l-yellow-500' 
          : 'border-l-green-500'
        : 'border-l-red-500'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCouponTypeIcon()}</span>
              <h4 className="text-lg font-semibold text-gray-900">
                {coupon.couponName}
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                coupon.type === 'specific' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {coupon.type === 'specific' ? 'Specific Users' : 'General Use'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
        </div>

        {/* Usage Stats */}
        {coupon.type === 'general' ? (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Usage</span>
              <span>{coupon.usageCount || 0} / {coupon.maxUses}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
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
        ) : (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span>Assigned: {coupon.assignedUsers?.length || 0} users</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Used by: {coupon.usedBy?.length || 0} users</span>
            </div>
          </div>
        )}

        {/* Expiry Date */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              Expires: {formatDate(coupon.expiryDate)}
              {isExpired && (
                <span className="ml-2 text-red-600 font-medium">(Expired)</span>
              )}
            </span>
          </div>
        </div>

        {/* Created Date */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Created: {formatDate(coupon.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(coupon._id)}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onToggleStatus(coupon._id)}
            disabled={isToggling}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              coupon.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isToggling 
              ? 'Updating...' 
              : coupon.isActive 
                ? 'Deactivate' 
                : 'Activate'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
