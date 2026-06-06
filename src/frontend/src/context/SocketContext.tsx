import { createContext, useState } from 'react';
import { socketService } from '../services/socket';

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
  const [socket] = useState(() => socketService.connect());

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
