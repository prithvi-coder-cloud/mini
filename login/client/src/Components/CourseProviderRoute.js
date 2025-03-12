import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const CourseProviderRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const location = useLocation();
  
  if (!user) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'course provider') {
    // Logged in but not a course provider, redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'company') {
      return <Navigate to="/companyhome" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Authorized course provider, render component
  return children;
};

export default CourseProviderRoute; 