import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const location = useLocation();
  
  if (!user) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Logged in but not an admin, redirect to appropriate dashboard based on role
    if (user.role === 'company') {
      return <Navigate to="/companyhome" replace />;
    } else if (user.role === 'course provider') {
      return <Navigate to="/course" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Authorized admin, render component
  return children;
};

export default AdminRoute; 