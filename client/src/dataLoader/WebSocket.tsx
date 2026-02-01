import { useEffect } from 'react';
import type { Message } from '../types/message';
import { socket } from '../socket';

interface Props {
  onData: (data: Message[]) => void;
}

export function WebSocketLoader({ onData }: Props) {
  useEffect(() => {
    const onHistory = (history: Message[]) => onData(history);
    socket.on('room:history', onHistory);
   return () => {
      socket.off('room:history', onHistory);
    };
  }, [onData]);

  return null;
}
