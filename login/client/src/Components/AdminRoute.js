import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    // Not an admin, redirect to home page
    return <Navigate to="/" />;
  }

  // Authorized, render component
  return children;
};

export default AdminRoute; 