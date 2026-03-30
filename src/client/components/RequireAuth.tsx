import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { usernameService } from '../services/usernameService';
import { userIdService } from '../services/userIdService';

export const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
  const username = usernameService.get();
  const userId = userIdService.get();
  const location = useLocation();

  if (!username || !userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};
