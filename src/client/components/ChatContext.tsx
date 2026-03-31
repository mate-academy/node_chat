/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
/* eslint-disable function-paren-newline */
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type User } from '@prisma/client';

import { RoomFullInform, RoomWithUsersList } from '../types/Room';
import { roomService } from '../services/roomService';
import { catchError, ErrorResponse } from '../utils/catchError';
import { useError } from './ErrorContext';
import { userIdService } from '../services/userIdService';
import { usernameService } from '../services/usernameService';
import { AxiosError } from 'axios';

const ChatContext = React.createContext({
  currentUser: {} as User,
  rooms: [] as RoomWithUsersList[] | null,
  selectedRoom: {} as RoomFullInform | null,
  messages: [] as RoomFullInform['messages'],
  setMessages: (() => {}) as Dispatch<
    SetStateAction<RoomFullInform['messages']>
  >,
  setCurrentUser: (() => {}) as Dispatch<SetStateAction<User>>,
  getRoom: async (_roomId: string) => {},
  getAllRooms: async () => {},
  socketRef: {} as React.RefObject<WebSocket | null>,
  sendMessage: (_data: object) => {},
  logout: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [rooms, setRooms] = useState<RoomWithUsersList[] | null>(null);
  const [messages, setMessages] = useState<RoomFullInform['messages']>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomFullInform | null>(null);
  const { setError } = useError();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = userIdService.get();
    const username = usernameService.get();

    return saved
      ? { id: +saved, username: username || '' }
      : { id: -1, username: '' };
  });

  const getAllRooms = useCallback(async () => {
    if (!currentUser?.id || currentUser.id === -1) {
      return;
    }

    try {
      const allRooms = await roomService.getAllRooms(currentUser.id);

      setRooms(allRooms);
    } catch (error) {
      catchError(error as AxiosError<ErrorResponse>, setError);
    }
  }, [currentUser]);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws${import.meta.env.VITE_API_URL}`);

    socketRef.current = socket;

    socket.onmessage = (event) => {
      let data;

      try {
        data = JSON.parse(event.data.toString());
      } catch (error) {
        sendMessage({
          type: 'error',
        });

        return;
      }

      switch (data.type) {
        case 'message':
          setMessages((prev) => [...prev, data.payload]);
          break;

        case 'rooms_updated':
          getAllRooms();
          break;

        case 'room_updated':
          setSelectedRoom((prev) =>
            // eslint-disable-next-line max-len
            String(prev?.id) === String(data.payload.id) ? data.payload : prev,
          );

          break;

        case 'user_left_room':
          setSelectedRoom((prev) =>
            prev
              ? {
                  ...prev,
                  users: prev.users.filter(
                    (user) => user.id !== data.payload.userId,
                  ),
                }
              : prev,
          );

          break;

        case 'room_deleted':
          setSelectedRoom((prev) => {
            if (String(prev?.id) === String(data.payload.id)) {
              return null;
            }

            return prev;
          });
          break;
      }
    };

    return () => socket.close();
  }, [getAllRooms]);

  useEffect(() => {
    if (!selectedRoom?.id || !currentUser?.id) {
      return;
    }

    sendMessage({
      type: 'subscribe',
      roomId: selectedRoom.id,
      userId: currentUser.id,
    });
  }, [selectedRoom?.id, currentUser?.id]);

  const sendMessage = (data: object) => {
    const socket = socketRef.current;

    if (!socket) {
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      socket.addEventListener(
        'open',
        () => {
          socket.send(JSON.stringify(data));
        },
        { once: true },
      );
    }
  };

  async function getRoom(roomId: string) {
    try {
      const room = await roomService.getRoom(roomId);

      setSelectedRoom(room);
      setMessages(room.messages);
    } catch (error) {
      catchError(error as AxiosError<ErrorResponse>, setError);
    }
  }

  const logout = () => {
    usernameService.remove();
    userIdService.remove();

    setRooms(null);
    setSelectedRoom(null);
    setMessages([]);
    setCurrentUser({ id: -1, username: '' });
  };

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      rooms,
      selectedRoom,
      messages,
      setMessages,
      getRoom,
      getAllRooms,
      socketRef,
      sendMessage,
      logout,
    }),
    [currentUser, rooms, selectedRoom, messages],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => React.useContext(ChatContext);
