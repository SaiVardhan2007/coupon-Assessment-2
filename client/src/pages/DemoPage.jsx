import React, { useState } from 'react';
import CouponCard from '../components/CouponCard';

const DemoPage = () => {
  // Sample coupon data for demonstration
  const [sampleCoupons] = useState([
    {
      _id: '1',
      title: 'Summer Sale',
      code: 'SUMMER2025',
      description: 'Get 20% off on all items during our summer sale',
      discountType: 'percentage',
      discountValue: 20,
      expiryDate: '2025-12-31T23:59:59.000Z',
      usageLimit: 100,
      usageCount: 15,
      minimumOrderValue: 50,
      status: 'active',
      createdAt: '2025-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Student Discount',
      code: 'STUDENT15',
      description: 'Special discount for students - save $15 on your next purchase',
      discountType: 'fixed',
      discountValue: 15,
      expiryDate: '2025-06-30T23:59:59.000Z',
      usageLimit: 50,
      usageCount: 35,
      minimumOrderValue: 75,
      status: 'active',
      createdAt: '2025-01-15T00:00:00.000Z'
    },
    {
      _id: '3',
      title: 'Early Bird Special',
      code: 'EARLYBIRD',
      description: 'Early bird gets the worm! 30% off for early shoppers',
      discountType: 'percentage',
      discountValue: 30,
      expiryDate: '2025-03-31T23:59:59.000Z',
      usageLimit: 25,
      usageCount: 25,
      minimumOrderValue: 100,
      status: 'active',
      createdAt: '2025-02-01T00:00:00.000Z'
    },
    {
      _id: '4',
      title: 'New Year Blast',
      code: 'NEWYEAR2025',
      description: 'Celebrate the new year with amazing savings',
      discountType: 'percentage',
      discountValue: 25,
      expiryDate: '2025-01-31T23:59:59.000Z',
      usageLimit: 200,
      usageCount: 150,
      minimumOrderValue: 30,
      status: 'expired',
      createdAt: '2024-12-25T00:00:00.000Z'
    }
  ]);

  const handleDemoRedeem = (coupon) => {
    alert(`Demo: Coupon "${coupon.title}" would be redeemed!`);
  };

  const handleDemoEdit = (coupon) => {
    alert(`Demo: Edit coupon "${coupon.title}"`);
  };

  const handleDemoDelete = (coupon) => {
    alert(`Demo: Delete coupon "${coupon.title}"`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Coupon System Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This is a demonstration of the coupon management system with sample data. 
              In a real application, this data would come from your backend API.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">🎫</div>
              <h3 className="text-lg font-semibold mb-2">Smart Coupons</h3>
              <p className="text-gray-600 text-sm">
                Dynamic coupon management with usage limits, expiry dates, and conditions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Track usage patterns, success rates, and user engagement
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-gray-600 text-sm">
                Instant validation and updates across all user sessions
              </p>
            </div>
          </div>

          {/* Sample Coupons */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sample Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {sampleCoupons.map((coupon) => (
                <CouponCard
                  key={coupon._id}
                  coupon={coupon}
                  onRedeem={handleDemoRedeem}
                  onEdit={handleDemoEdit}
                  onDelete={handleDemoDelete}
                  showActions={true}
                  isAdmin={false}
                />
              ))}
            </div>
          </div>

          {/* Admin View Demo */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Management Features</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Create and edit coupons with rich form validation
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Set usage limits, expiry dates, and minimum order values
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Track real-time usage statistics and analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Bulk operations for managing multiple coupons
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">User Experience</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Search and filter coupons by various criteria
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Responsive design works on all devices
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Intuitive pagination for large datasets
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Real-time validation and error handling
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
