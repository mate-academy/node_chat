import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types/types';

type OptionalUser = User | null | undefined;

interface UserContextProps {
  user: OptionalUser;
  setUser: (user: OptionalUser) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OptionalUser>();

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
