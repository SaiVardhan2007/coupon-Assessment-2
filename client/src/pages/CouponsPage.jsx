import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CouponCard from '../components/CouponCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const CouponsPage = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, active, expired, inactive
    type: 'all', // all, general, specific
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [coupons, searchTerm, filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      // Get available coupons for the user
      const response = await api.get('/api/user/coupons/available');
      setCoupons(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch coupons. Please try again.');
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...coupons];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.couponName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(coupon => {
        const isExpired = new Date(coupon.expiryDate) < new Date();
        const isUsedUp = coupon.type === 'general' && coupon.usageCount >= coupon.maxUses;
        
        switch (filters.status) {
          case 'active':
            return coupon.isActive && !isExpired && !isUsedUp;
          case 'expired':
            return isExpired;
          case 'inactive':
            return !coupon.isActive;
          default:
            return true;
        }
      });
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(coupon => coupon.type === filters.type);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'expiryDate' || filters.sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCoupons(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRedeemCoupon = async (coupon) => {
    try {
      await api.post('/api/user/coupons/redeem', { couponName: coupon.couponName });
      fetchCoupons(); // Refresh the list
      alert('Coupon redeemed successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to redeem coupon. Please try again.';
      alert(errorMessage);
      console.error('Error redeeming coupon:', err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoupons = filteredCoupons.slice(startIndex, endIndex);

  if (loading) {
    return <LoadingSpinner text="Loading coupons..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Available Coupons
            </h1>
            <p className="text-lg text-gray-600">
              Discover and redeem assessment platform coupons
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Coupons
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="specific">Specific</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({...filters, sortBy, sortOrder});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="expiryDate-asc">Expiring Soon</option>
                  <option value="expiryDate-desc">Expiring Later</option>
                  <option value="couponName-asc">Name A-Z</option>
                  <option value="couponName-desc">Name Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {filteredCoupons.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredCoupons.length} coupon{filteredCoupons.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          )}

          {/* Coupons Grid */}
          {currentCoupons.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    onRedeem={handleRedeemCoupon}
                    showActions={true}
                    isAdmin={false}
                  />
                ))}
              </div>

              {/* Simple Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No coupons found
              </h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'createdAt' && f !== 'desc')
                  ? 'Try adjusting your search or filters'
                  : 'No coupons are currently available for you'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
