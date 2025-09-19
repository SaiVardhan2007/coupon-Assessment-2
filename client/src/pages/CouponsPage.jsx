import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CouponCard from '../components/CouponCard';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

const CouponsPage = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    fetchCoupons();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [coupons, searchTerm, filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/coupons');
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

    // Apply filters
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRedeemCoupon = async (coupon) => {
    try {
      await api.post(`/api/coupons/${coupon._id}/redeem`);
      fetchCoupons(); // Refresh the list
      alert('Coupon redeemed successfully!');
    } catch (err) {
      alert('Failed to redeem coupon. Please try again.');
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
              Discover and redeem amazing deals and discounts
            </p>
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
                    onRedeem={handleRedeemCoupon}
                    showActions={true}
                    isAdmin={false}
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
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 'createdAt' && f !== 'desc')
                  ? 'Try adjusting your search or filters'
                  : 'No coupons are currently available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
