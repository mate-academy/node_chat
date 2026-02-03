import React, { createContext, ReactNode, useEffect, useState } from 'react';

type AuthContextType = {
  userName: string | null,
  setUserName: React.Dispatch<React.SetStateAction<string | null>>,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem('userName')
  );

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    } else {
      localStorage.removeItem('userName');
    }
  }, [userName]);

  const value = {
    userName,
    setUserName,
  };
  return <AuthContext.Provider value={value} >{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};