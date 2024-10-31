import React, { useEffect, useMemo, useState } from 'react';

export const Context = React.createContext({});

export const ContextProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [anyError, setAnyError] = useState(null);
  const [allChats, setAllChats] = useState([]);

  const socket = useMemo(() => new WebSocket('ws://localhost:7070'), []);

  useEffect(() => {
    socket.onmessage = ({ data }) => {
      console.log('Message from server', JSON.parse(data));
      setCurrentRoom(JSON.parse(data));
    };

    return () => {
      socket.close();
    };
  }, [setCurrentRoom, socket]);

  const sendMessage = (message) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.log('WebSocket is not open');
    }
  };

  const value = useMemo(
    () => ({
      currentRoom,
      setCurrentRoom,
      user,
      setUser,
      anyError,
      setAnyError,
      allChats,
      setAllChats,
      sendMessage,
      socket,
    }),
    [currentRoom, user, anyError, allChats, socket],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
