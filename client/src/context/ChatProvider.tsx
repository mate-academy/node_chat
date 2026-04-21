import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChatContext } from './ChatContext';
import {
  type ChatMessage,
  type WSMessage,
  type Room,
} from '../shared/types';
import { MessageType } from '../shared/types';

// Розширюємо тип для WebSocket, якщо потрібно, або використовуємо стандартний
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // 1. Початкове завантаження кімнат через API
  useEffect(() => {
    axios
      .get('http://localhost:5700/api/rooms')
      .then((res) => setRooms(res.data))
      .catch((err) => console.error('Error loading rooms', err));
  }, []);

  // 2. Налаштування WebSocket
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5700');

    ws.onopen = () => {
      console.log('✅ Connected to WS');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);

        if (data.type === MessageType.MESSAGE_NEW) {
          setMessages((prev) => [...prev, data.payload]);
        }

        if (data.type === MessageType.ROOM_NEW) {
          setRooms((prev) => [...prev, data.payload]);
        }

        if (data.type === MessageType.ROOM_RENAMED) {
          setRooms((prev) =>
            prev.map((r) =>
              r.id === data.payload.roomId ? { ...r, name: data.payload.newName } : r,
            ),
          );
        }

        if (data.type === MessageType.ROOM_DELETED) {
          setRooms((prev) => prev.filter((r) => r.id !== data.payload.roomId));
        }
      } catch (err) {
        console.error('WS Message Error:', err);
      }
    };

    ws.onclose = () => {
      console.log('❌ WS Disconnected');
      setSocket(null);
    };

    return () => ws.close();
  }, []);

  const sendMessage = useCallback(
    (text: string, roomId: number, userId: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: MessageType.MESSAGE_SEND,
            payload: { text, roomId, userId },
          }),
        );
      }
    },
    [socket],
  );

  const joinRoom = useCallback(
    (roomId: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: MessageType.ROOM_JOIN,
            payload: { roomId },
          }),
        );
      }
    },
    [socket],
  );

  const createRoom = useCallback(
    (name: string, userId: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: MessageType.ROOM_CREATE,
            payload: { name, userId },
          }),
        );
      }
    },
    [socket],
  );

  const renameRoom = useCallback(
    (roomId: number, newName: string, userId: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: MessageType.ROOM_RENAME,
            payload: { roomId, newName, userId },
          }),
        );
      }
    },
    [socket],
  );

  const deleteRoom = useCallback(
    (roomId: number, userId: number) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: MessageType.ROOM_DELETE,
            payload: { roomId, userId },
          }),
        );
      }
    },
    [socket],
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        rooms,
        createRoom,
        joinRoom,
        renameRoom,
        deleteRoom,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
