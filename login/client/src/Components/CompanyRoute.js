import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const CompanyRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const location = useLocation();
  
  if (!user) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'company') {
    // Logged in but not a company, redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'course provider') {
      return <Navigate to="/course" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Authorized company user, render component
  return children;
};

export default CompanyRoute; 