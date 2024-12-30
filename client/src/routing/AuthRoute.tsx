import { Loader } from '@/components/Loader/Loader';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AuthRoute = (): ReactNode => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated && (location.pathname === '/signin' || location.pathname === '/signup')) {
    return <Navigate to='/chat' />;
  }

  return <Outlet />;
};

export default AuthRoute;
