import React, { createContext, useMemo, useState, ReactNode } from 'react';

import { Room } from '../types/Room';
import { Message } from '../types/Message';

interface DataContextType {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;

  roomMessages: Message[];
  setRoomMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface DataProviderProps {
  children: ReactNode;
}

export const DataContext = createContext<DataContextType>(
  {} as DataContextType,
);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);

  const value = useMemo<DataContextType>(
    () => ({
      rooms,
      setRooms,
      roomMessages,
      setRoomMessages,
    }),
    [rooms, roomMessages],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
