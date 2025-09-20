import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to MentorHub
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            A modern  application for career mentoring and guidance.
          </p>

          {user ? (
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {user.role !== 'admin' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">Assessments</h3>
                    <p className="text-gray-600 mb-4">Take tests and track your progress</p>
                    <Link
                    to="/assessments"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors inline-block"
                    >
                    Start Assessment
                    </Link>
                </div>
              )} 
              
              
              {user.role !== 'admin' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl mb-4">👤</div>
                  <h3 className="text-xl font-semibold mb-2">My Profile</h3>
                  <p className="text-gray-600 mb-4">View your profile and usage history</p>
                  <Link
                    to="/profile"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors inline-block"
                  >
                    View Profile
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">Assessments</h3>
                <p className="text-gray-600">Take tests and track your progress</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">👤</div>
                <h3 className="text-xl font-semibold mb-2">Customize</h3>
                <p className="text-gray-600">Get personalized experience</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Future ready study plan</h3>
                <p className="text-gray-600">Get a personalized study plan tailored to your needs</p>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Login
              </Link>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">For Students</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>• Access exclusive student discounts</li>
                <li>• Take comprehensive assessments</li>
                <li>• Track your savings and learning progress</li>
                <li>• Get coupons based on your study level</li>
                <li>• Easy to use interface</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">For Administrators</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>• Manage coupon distribution</li>
                <li>• Monitor usage analytics</li>
                <li>• Control user access and permissions</li>
                <li>• Create and manage assessments</li>
                <li>• Generate comprehensive reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Coupon Assessment. Built with MERN Stack.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
