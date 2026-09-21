import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

type RequireAuthProps = {
  children: React.ReactNode;
  roles?: Array<'ADMIN' | 'ANALYST' | 'OFFICER' | 'VIEWER'>;
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};