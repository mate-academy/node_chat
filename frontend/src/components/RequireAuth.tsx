import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { ReactNode, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { Loader } from './Loader.js';

interface Props {
  children?: ReactNode;
}

export const RequireAuth: React.FC<Props> = ({ children }) => {
  const { isChecked, currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!isChecked) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};
