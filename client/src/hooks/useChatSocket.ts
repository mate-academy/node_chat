
import { useEffect } from 'react';
import type { Message } from '../types';
import { socket } from '../services/socket';

interface UseChatSocketProps {
  username: string;
  roomId: number | null;
  onMessage: (message: Message) => void;
}

export const useChatSocket = ({
  username,
  roomId,
  onMessage,
}: UseChatSocketProps) => {
  useEffect(() => {
    if (!username) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('set_username', username);

    return () => {
      socket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join_room', roomId);

    return () => {
      socket.emit('leave_room', roomId);
    };
  }, [roomId]);

  useEffect(() => {
    socket.on('receive_message', onMessage);

    return () => {
      socket.off('receive_message', onMessage);
    };
  }, [onMessage]);
};
