import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      const response = await api.get('/');
      setServerStatus('connected');
      setServerMessage(response.data.message || 'Server connected successfully');
    } catch (error) {
      setServerStatus('error');
      setServerMessage('Unable to connect to server. Make sure the backend is running on port 5000.');
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return 'text-green-600 bg-green-100 border-green-300';
      case 'error': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Server Connection</h2>
              <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{getStatusIcon()}</span>
                  <span className="font-semibold capitalize">{serverStatus}</span>
                </div>
                <p>{serverMessage}</p>
              </div>
              <button 
                onClick={checkServerConnection}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Test Connection
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
                  Create New Coupon
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors">
                  View All Coupons
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Project Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">⚛️</div>
                <h3 className="font-semibold">Frontend</h3>
                <div className="text-green-600 font-medium">Ready</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔧</div>
                <h3 className="font-semibold">Backend</h3>
                <div className={serverStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                  {serverStatus === 'connected' ? 'Ready' : 'Not Connected'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🗃️</div>
                <h3 className="font-semibold">Database</h3>
                <div className="text-yellow-600 font-medium">Configure</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              to="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
            >
              Back to Home
            </Link>
            <Link 
              to="/about" 
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              About Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
