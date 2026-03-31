import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { usernameService } from '../services/usernameService';
import { userIdService } from '../services/userIdService';

export const RequireNonAuth = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const username = usernameService.get();
  const userId = userIdService.get();

  if (username || userId) {
    return <Navigate to="/rooms" replace />;
  }

  return children ?? <Outlet />;
};
