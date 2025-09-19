import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Verify token with server
        const response = await api.get('/api/users/verify', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });
        
        if (response.data.success) {
          setUser(response.data.data.user);
          setToken(storedToken);
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        // Store user and token
        setUser(userData);
        setToken(userToken);
        
        // Persist token in localStorage
        localStorage.setItem('token', userToken);
        
        // Set default authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);

      if (response.data.success) {
        const { user: newUser, token: userToken } = response.data.data;
        
        // Store user and token
        setUser(newUser);
        setToken(userToken);
        
        // Persist token in localStorage
        localStorage.setItem('token', userToken);
        
        // Set default authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        return newUser;
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          error.message || 
                          'Signup failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Clear user state
    setUser(null);
    setToken(null);
    
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshUserData = async () => {
    if (!token) return;
    
    try {
      const response = await api.get('/api/users/profile');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If token is invalid, logout user
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    refreshUserData,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
