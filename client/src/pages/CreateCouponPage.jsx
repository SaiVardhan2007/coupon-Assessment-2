import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const CreateCouponPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // Form state
  const [couponName, setCouponName] = useState('');
  const [type, setType] = useState('general'); // 'general' or 'specific'
  const [maxUses, setMaxUses] = useState(1);
  const [assignedUsers, setAssignedUsers] = useState([]); // array of user IDs
  const [expiryOption, setExpiryOption] = useState('1_hour'); // predefined expiry options

  // UI state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/api/admin/users');
      // Filter out admin users for coupon assignment
      const regularUsers = response.data.filter(user => user.role !== 'admin');
      setUsers(regularUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSubmitError('Failed to fetch users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCouponNameChange = (e) => {
    setCouponName(e.target.value);
    if (errors.couponName) {
      setErrors(prev => ({ ...prev, couponName: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleMaxUsesChange = (e) => {
    setMaxUses(parseInt(e.target.value) || 1);
    if (errors.maxUses) {
      setErrors(prev => ({ ...prev, maxUses: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleExpiryOptionChange = (e) => {
    setExpiryOption(e.target.value);
    if (errors.expiryOption) {
      setErrors(prev => ({ ...prev, expiryOption: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setAssignedUsers([]); // Reset assigned users when changing type
    if (newType === 'general') {
      setMaxUses(1);
    }
    if (errors.type || errors.assignedUsers || errors.maxUses) {
      setErrors(prev => ({ ...prev, type: '', assignedUsers: '', maxUses: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleUserSelection = (userId) => {
    setAssignedUsers(prev => {
      const isSelected = prev.includes(userId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      return newSelection;
    });
    
    if (errors.assignedUsers) {
      setErrors(prev => ({ ...prev, assignedUsers: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!couponName.trim()) {
      newErrors.couponName = 'Coupon name is required';
    } else if (couponName.length < 3) {
      newErrors.couponName = 'Coupon name must be at least 3 characters';
    } else if (couponName.length > 100) {
      newErrors.couponName = 'Coupon name cannot exceed 100 characters';
    }

    // Expiry option validation
    if (!expiryOption) {
      newErrors.expiryOption = 'Please select an expiry option';
    }

    // Type-specific validation
    if (type === 'specific') {
      if (assignedUsers.length === 0) {
        newErrors.assignedUsers = 'Please select at least one user for specific coupons';
      }
    } else if (type === 'general') {
      if (!maxUses || maxUses < 1) {
        newErrors.maxUses = 'Max uses must be at least 1';
      } else if (maxUses > 10000) {
        newErrors.maxUses = 'Max uses cannot exceed 10,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');

      // Calculate expiry date based on selected option
      const now = new Date();
      let durationInMs;
      
      switch (expiryOption) {
        case '1_hour':
          durationInMs = 1 * 60 * 60 * 1000;
          break;
        case '6_hours':
          durationInMs = 6 * 60 * 60 * 1000;
          break;
        case '12_hours':
          durationInMs = 12 * 60 * 60 * 1000;
          break;
        case '1_day':
          durationInMs = 1 * 24 * 60 * 60 * 1000;
          break;
        case '3_days':
          durationInMs = 3 * 24 * 60 * 60 * 1000;
          break;
        case '1_week':
          durationInMs = 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          durationInMs = 1 * 60 * 60 * 1000; // default to 1 hour
      }
      
      const expiryDate = new Date(now.getTime() + durationInMs);

      const submitData = {
        couponName: couponName.trim(),
        type: type,
        expiryDate: expiryDate.toISOString()
      };

      // Add type-specific data
      if (type === 'specific') {
        submitData.assignedUsers = assignedUsers;
      } else {
        submitData.maxUses = maxUses;
      }

      const response = await api.post('/api/admin/coupons', submitData);
      
      // Success - show success message and navigate back to admin dashboard
      alert('Coupon created successfully!');
      navigate('/admin-dashboard');

    } catch (error) {
      console.error('Error creating coupon:', error);
      
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        setSubmitError(error.response.data.errors.join(', '));
      } else {
        setSubmitError('Failed to create coupon. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  // Redirect if not admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Coupon</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create a new coupon for your platform users
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              
              {/* Coupon Name */}
              <div className="mb-4">
                <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Name *
                </label>
                <input
                  type="text"
                  id="couponName"
                  name="couponName"
                  value={couponName}
                  onChange={handleCouponNameChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                    errors.couponName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="Enter coupon name"
                />
                {errors.couponName && (
                  <p className="mt-1 text-sm text-red-600">{errors.couponName}</p>
                )}
              </div>

              {/* Expiry Duration */}
              <div className="mb-4">
                <label htmlFor="expiryOption" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Duration *
                </label>
                <select
                  id="expiryOption"
                  name="expiryOption"
                  value={expiryOption}
                  onChange={handleExpiryOptionChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                    errors.expiryOption 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                >
                  <option value="1_hour">1 Hour</option>
                  <option value="6_hours">6 Hours</option>
                  <option value="12_hours">12 Hours</option>
                  <option value="1_day">1 Day</option>
                  <option value="3_days">3 Days</option>
                  <option value="1_week">1 Week</option>
                </select>
                {errors.expiryOption && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryOption}</p>
                )}
              </div>

            </div>
          </div>

          {/* Coupon Type Selection */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Coupon Type</h2>
              
              <div className="space-y-4">
                {/* Radio buttons for type selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      id="type-general"
                      name="type"
                      type="radio"
                      checked={type === 'general'}
                      onChange={() => handleTypeChange('general')}
                      className="sr-only"
                    />
                    <label
                      htmlFor="type-general"
                      className={`block w-full p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        type === 'general'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          type === 'general'
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {type === 'general' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">General</div>
                          <div className="text-sm text-gray-600">Available to anyone up to a usage limit</div>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="type-specific"
                      name="type"
                      type="radio"
                      checked={type === 'specific'}
                      onChange={() => handleTypeChange('specific')}
                      className="sr-only"
                    />
                    <label
                      htmlFor="type-specific"
                      className={`block w-full p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        type === 'specific'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          type === 'specific'
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {type === 'specific' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Specific</div>
                          <div className="text-sm text-gray-600">Assigned to specific, selected users</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Conditional rendering based on type */}
                {type === 'general' && (
                  <div className="mt-4">
                    <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Uses *
                    </label>
                    <input
                      type="number"
                      id="maxUses"
                      name="maxUses"
                      value={maxUses}
                      onChange={handleMaxUsesChange}
                      min="1"
                      max="10000"
                      className={`w-full max-w-xs px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                        errors.maxUses 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                      placeholder="100"
                    />
                    {errors.maxUses && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxUses}</p>
                    )}
                  </div>
                )}

                {type === 'specific' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Users * ({assignedUsers.length} selected)
                    </label>
                    
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner text="Loading users..." />
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {users.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No users available for assignment
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {users.map((user) => (
                              <div key={user._id} className="p-3 hover:bg-gray-50">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={assignedUsers.includes(user._id)}
                                    onChange={() => handleUserSelection(user._id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">
                                          {user.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {errors.assignedUsers && (
                      <p className="mt-1 text-sm text-red-600">{errors.assignedUsers}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Coupon'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCouponPage;
