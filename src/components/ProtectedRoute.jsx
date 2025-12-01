import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingIcon from '@/components/LoadingIcon';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  // This ensures we don't redirect prematurely on page reload
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingIcon />
      </div>
    );
  }

  // Only redirect if we're sure the user is not logged in
  // After isLoading is false, isLoggedIn will have the correct value
  if (!isLoggedIn) {
    // Redirect to login with the attempted URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
