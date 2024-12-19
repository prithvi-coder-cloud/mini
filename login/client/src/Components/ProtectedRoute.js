import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem('user'); // Check if the user is logged in

  return user ? children : <Navigate to="/login" />; // If logged in, render children; otherwise, redirect
};

export default ProtectedRoute;
