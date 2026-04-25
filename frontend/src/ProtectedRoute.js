import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  // Se não tem token ou não é admin, chuta de volta pra tela de login
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Se for admin, libera o acesso!
  return children;
};

export default ProtectedRoute;
