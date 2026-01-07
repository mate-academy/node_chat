import React, { useState } from 'react';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') || null;
  });

  const login = (userName) => {
    localStorage.setItem('user', userName);

    setUser(userName);
  };

  const logout = () => {
    localStorage.removeItem('user');

    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
