import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { TextMessage } from './types/TextMessage.ts';
import type { RoomMessage } from './types/RoomMessage.ts';
import type { LoginMessage } from './types/LoginMessage.ts';

export type Room = string;
export type Rooms = Room[];

export type Message = {
  author: string;
  text: string;
  time: string;
};

export type RoomMessages = { title: Room; messages: Message[] };

type Messages = RoomMessages[];

interface WebSocketContextType {
  userName: string;
  login: (userName: string) => void;
  logout: () => void;
  rooms: Rooms;
  messages: Messages;
  sendMessage: (data: TextMessage | RoomMessage | LoginMessage) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const STORAGE_KEY_USER = 'username';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<Rooms>([]);
  const [messages, setMessages] = useState<Messages>([]);
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY_USER) || '',
  );
  const socketRef = useRef<WebSocket | null>(null);

  const login = (userName: string) => {
    localStorage.setItem(STORAGE_KEY_USER, userName);
    setUserName(userName);
    sendMessage({ type: 'login', userName });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    setUserName('');
    setRooms([]);
    setMessages([]);
  };

  const sendMessage = (data: TextMessage | RoomMessage | LoginMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify(data);
      socketRef.current.send(payload);
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const socket = new WebSocket(
      `ws://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}`,
    );
    socketRef.current = socket;

    socket.onopen = () => {
      if (isCancelled) return;

      setIsConnected(true);

      if (userName) {
        sendMessage({ type: 'login', userName });
      }
    };

    socket.onclose = () => {
      if (isCancelled) return;

      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      if (isCancelled) return;

      const data = JSON.parse(event.data);

      if (data.messages) {
        setMessages(data.messages);
      }

      if (data.rooms) {
        setRooms(data.rooms);
      }
    };

    return () => {
      isCancelled = true;

      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;

      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        userName,
        login,
        logout,
        rooms,
        messages,
        sendMessage,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook for easy usage in components
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
