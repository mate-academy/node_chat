import { Navigate, Outlet } from 'react-router-dom';
import React, { ReactNode, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { Loader } from './Loader.js';

type Props = {
  children?: ReactNode;
};

export const RequireNonAuth: React.FC<Props> = ({ children }) => {
  const { isChecked, currentUser } = useContext(AuthContext);

  if (!isChecked) {
    return <Loader />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};
