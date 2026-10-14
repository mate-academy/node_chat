import React, { useState, createContext } from 'react';
import { socketService } from '../services/socetService';

// eslint-disable-next-line
type SocketContextType = {
  socket: WebSocket | null;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext<SocketContextType>({
  socket: null,
});

type Props = {
  children: React.ReactNode;
};

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const [socket] = useState(() => socketService.socketConnect());

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
