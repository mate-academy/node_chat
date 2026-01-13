import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useSocket } from "./SocketProvider";
import type { Message } from "../types/message";

type MessagesByRoom = Record<string, Message[]>;

const MessagesContext = createContext<{
  messagesByRoom: MessagesByRoom;
  fetchHistory: (roomId: string) => Promise<void>;
  addLocalMessage: (m: Message) => void;
} | null>(null);

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used inside MessagesProvider");
  return ctx;
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messagesByRoom, setMessagesByRoom] = useState<MessagesByRoom>({});
  const socket = useSocket();

  useEffect(() => {
    const off = socket.on("new_message", ({ message }) => {
      setMessagesByRoom((prev) => {
        const roomMsgs = prev[message.roomId] || [];

        if (roomMsgs.some((m) => m.id === message.id)) {
          return prev;
        }

        return {
          ...prev,
          [message.roomId]: [...roomMsgs, message],
        };
      });
    });
    return () => off();
  }, [socket]);

  const fetchHistory = async (roomId: string) => {
    const resp = await api.get(`/rooms/${roomId}/messages`);
    setMessagesByRoom((prev) => ({ ...prev, [roomId]: resp.data }));
  };

  const addLocalMessage = (m: Message) => {
    setMessagesByRoom((prev) => ({
      ...prev,
      [m.roomId]: [...(prev[m.roomId] || []), m],
    }));
  };

  return (
    <MessagesContext.Provider
      value={{ messagesByRoom, fetchHistory, addLocalMessage }}
    >
      {children}
    </MessagesContext.Provider>
  );
};
