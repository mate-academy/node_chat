import { useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const RequireAuth = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
