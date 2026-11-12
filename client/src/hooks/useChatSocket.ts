import { useEffect } from 'react';
import type { Message } from '../types';
import { socket, setUsername } from '../services/socket';

interface UseChatSocketProps {
  username: string;
  roomId: number | null;
  onMessage: (message: Message) => void;
  onHistory: (messages: Message[]) => void;
}

export const useChatSocket = ({
  username,
  roomId,
  onMessage,
  onHistory,
}: UseChatSocketProps) => {
  // Listen for incoming messages and room history
  useEffect(() => {
    socket.on('receive_message', onMessage);
    socket.on('room_history', onHistory);

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('room_history', onHistory);
    };
  }, [onMessage, onHistory]);

  // Connect socket and register username
  useEffect(() => {
    if (!username) return;

    if (!socket.connected) {
      socket.connect();
    }

    setUsername(username);

    return () => {
      socket.disconnect();
    };
  }, [username]);

  // Join room when username and room are available
  useEffect(() => {
    if (!username || !roomId) return;

    socket.emit('join_room', roomId);

    return () => {
      socket.emit('leave_room', roomId);
    };
  }, [username, roomId]);
};
