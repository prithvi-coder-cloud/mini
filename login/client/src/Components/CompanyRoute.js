
import React from 'react';
import { Navigate } from 'react-router-dom';

const CompanyRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (user.role !== 'company') {
    // Not an admin, redirect to home page
    return <Navigate to="/" />;
  }

  // Authorized, render component
  return children;
};

export default CompanyRoute; 