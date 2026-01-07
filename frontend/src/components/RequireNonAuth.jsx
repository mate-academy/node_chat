import { useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

export const RequireNonAuth = () => {
  const { user } = useContext(UserContext);

  if (user) {
    return <Navigate to="/lobby" replace />;
  }

  return <Outlet />;
};
