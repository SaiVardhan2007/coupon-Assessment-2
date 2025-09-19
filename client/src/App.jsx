import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage, LoginPage, SignupPage, CouponsPage, AdminDashboard, CreateCouponPage, CouponDetailsPage, ProfilePage, DemoPage, UserDashboard, AssessmentPage, ExamPage, ExamResultsPage } from './pages';
import { ProtectedRoute, AdminRoute, Navbar } from './components';
import LoadingSpinner from './components/LoadingSpinner';

// Public Route Component (redirect to home if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/demo" element={<DemoPage />} />
        
        {/* Auth Routes - redirect to home if already authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessments" 
          element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/exam/start" 
          element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/exam/results" 
          element={
            <ProtectedRoute>
              <ExamResultsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/create-coupon" 
          element={
            <AdminRoute>
              <CreateCouponPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/coupon-details/:id" 
          element={
            <AdminRoute>
              <CouponDetailsPage />
            </AdminRoute>
          } 
        />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
