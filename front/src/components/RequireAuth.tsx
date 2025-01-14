import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};
