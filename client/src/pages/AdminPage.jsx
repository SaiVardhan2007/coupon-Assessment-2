import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CouponCard from '../components/CouponCard';
import CouponForm from '../components/CouponForm';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    discountType: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [coupons, searchTerm, filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/coupons');
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
        coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters (same logic as CouponsPage)
    if (filters.status !== 'all') {
      filtered = filtered.filter(coupon => {
        if (filters.status === 'expired') {
          return new Date(coupon.expiryDate) < new Date();
        }
        if (filters.status === 'used') {
          return coupon.usageCount >= coupon.usageLimit;
        }
        return coupon.status === filters.status;
      });
    }

    if (filters.discountType !== 'all') {
      filtered = filtered.filter(coupon => coupon.discountType === filters.discountType);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(coupon => {
        const expiryDate = new Date(coupon.expiryDate);
        switch (filters.dateRange) {
          case 'today':
            return expiryDate.toDateString() === now.toDateString();
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return expiryDate <= weekFromNow && expiryDate >= now;
          case 'month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return expiryDate <= monthFromNow && expiryDate >= now;
          case 'expired':
            return expiryDate < now;
          case 'expiring-soon':
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            return expiryDate <= threeDaysFromNow && expiryDate >= now;
          default:
            return true;
        }
      });
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
    setCurrentPage(1);
  };

  const handleCreateCoupon = async (couponData) => {
    try {
      setActionLoading(true);
      await api.post('/api/admin/coupons', couponData);
      await fetchCoupons();
      setShowCreateForm(false);
      alert('Coupon created successfully!');
    } catch (err) {
      alert('Failed to create coupon. Please try again.');
      console.error('Error creating coupon:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCoupon = async (couponData) => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/coupons/${editingCoupon._id}`, couponData);
      await fetchCoupons();
      setEditingCoupon(null);
      alert('Coupon updated successfully!');
    } catch (err) {
      alert('Failed to update coupon. Please try again.');
      console.error('Error updating coupon:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/api/admin/coupons/${deletingCoupon._id}`);
      await fetchCoupons();
      setDeletingCoupon(null);
      alert('Coupon deleted successfully!');
    } catch (err) {
      alert('Failed to delete coupon. Please try again.');
      console.error('Error deleting coupon:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoupons = filteredCoupons.slice(startIndex, endIndex);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  // Show form if creating or editing
  if (showCreateForm || editingCoupon) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <CouponForm
              coupon={editingCoupon}
              onSubmit={editingCoupon ? handleEditCoupon : handleCreateCoupon}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingCoupon(null);
              }}
              isLoading={actionLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Manage coupons and monitor system activity
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 sm:mt-0 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Create New Coupon
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">🎫</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Coupons</p>
                  <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Coupons</p>
                  <p className="text-2xl font-bold text-green-600">
                    {coupons.filter(c => c.status === 'active' && new Date(c.expiryDate) > new Date()).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">❌</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expired Coupons</p>
                  <p className="text-2xl font-bold text-red-600">
                    {coupons.filter(c => new Date(c.expiryDate) < new Date()).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="text-3xl mr-3">📊</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Search and Filter */}
          <SearchFilter
            onSearch={setSearchTerm}
            onFilter={setFilters}
            filters={filters}
          />

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
                    onEdit={setEditingCoupon}
                    onDelete={setDeletingCoupon}
                    showActions={true}
                    isAdmin={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredCoupons.length}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No coupons found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'createdAt' && f !== 'desc')
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first coupon'}
              </p>
              {!searchTerm && !Object.values(filters).some(f => f !== 'all' && f !== 'createdAt' && f !== 'desc') && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Create Your First Coupon
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingCoupon}
        title="Delete Coupon"
        message={`Are you sure you want to delete the coupon "${deletingCoupon?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteCoupon}
        onCancel={() => setDeletingCoupon(null)}
      />
    </div>
  );
};

export default AdminPage;
