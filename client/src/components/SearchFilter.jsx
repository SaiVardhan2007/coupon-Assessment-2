import React, { useState } from 'react';

const SearchFilter = ({ 
  onSearch, 
  onFilter, 
  filters = {},
  showStatusFilter = true,
  showTypeFilter = true,
  showDateFilter = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || 'all',
    discountType: filters.discountType || 'all',
    dateRange: filters.dateRange || 'all',
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc'
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...localFilters,
      [filterName]: value
    };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      status: 'all',
      discountType: 'all',
      dateRange: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(defaultFilters);
    setSearchTerm('');
    onSearch('');
    onFilter(defaultFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        
        {/* Search Bar */}
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search coupons by title, code, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center space-x-2 space-y-2 lg:space-y-0">
          
          {/* Status Filter */}
          {showStatusFilter && (
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="used">Used</option>
            </select>
          )}

          {/* Discount Type Filter */}
          {showTypeFilter && (
            <select
              value={localFilters.discountType}
              onChange={(e) => handleFilterChange('discountType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          )}

          {/* Date Range Filter */}
          {showDateFilter && (
            <select
              value={localFilters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="expired">Expired</option>
              <option value="expiring-soon">Expiring Soon</option>
            </select>
          )}

          {/* Sort By */}
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="expiryDate">Expiry Date</option>
            <option value="title">Title</option>
            <option value="discountValue">Discount Value</option>
            <option value="usageCount">Usage Count</option>
          </select>

          {/* Sort Order */}
          <select
            value={localFilters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(localFilters).map(([key, value]) => {
          if (value === 'all' || key === 'sortBy' || key === 'sortOrder') return null;
          
          return (
            <span
              key={key}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {key}: {value}
              <button
                onClick={() => handleFilterChange(key, 'all')}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </span>
          );
        })}
        {searchTerm && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Search: "{searchTerm}"
            <button
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
