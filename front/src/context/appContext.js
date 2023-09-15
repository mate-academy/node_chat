import React, { useState } from "react";

export const AppContext = React.createContext({
  user: null,
  setUser: () => {},
  currentRoom: null,
  setCurrentRoom: () => {},
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  const contextValue = {
    user,
    setUser,
    currentRoom,
    setCurrentRoom,
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
