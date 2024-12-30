import { Loader } from '@/components/Loader/Loader';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = (): ReactNode => {
  const { isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated && (location.pathname === '/signin' || location.pathname === '/signup')) {
    return <Navigate to='/chat' />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to='/signin' replace />;
};

export default ProtectedRoute;
