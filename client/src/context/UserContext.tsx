import { User } from '@/types/User';
import { createContext } from 'react';

interface IUserContext {
  user: User | null;
  handleSignIn: (name: string) => Promise<void>;
  handleSignUp: (name: string) => Promise<void>;
  handleLogOut: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  handleSignIn: async () => {},
  handleSignUp: async () => {},
  handleLogOut: () => {},
  isAuthenticated: false,
  isLoading: false,
});
