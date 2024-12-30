import { UserContext } from '@/context/UserContext';
import { useContext } from 'react';

export const useAuth = () => {
  const { isAuthenticated, isLoading } = useContext(UserContext);
  return { isAuthenticated, isLoading };
};
