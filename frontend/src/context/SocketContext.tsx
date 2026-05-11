import { io, Socket } from "socket.io-client";
import { createContext } from 'react';

const socketConnection = io('http://localhost:5000');
// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider value={socketConnection}>
      {children}
    </SocketContext.Provider>
  );
}



