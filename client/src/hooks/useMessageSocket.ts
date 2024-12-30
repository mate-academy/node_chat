import { Message } from '@/types/Message';
import notification from '@/utils/notification';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react';

export const useMessageSocket = (roomId: string, setMessages: Dispatch<SetStateAction<Message[]>>) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);

  const clear = () => {
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current);
      reconnectInterval.current = null;
    }
  };

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(`ws://${process.env.HOST}`);

    ws.onopen = () => {
      clear();
      notification('success', 'Reconnected to the server');
    };

    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);

      if (message.roomId === roomId) {
        setMessages((state) => [...state, message]);
      }
    };

    ws.onerror = () => {
      notification('error', 'Connection is lost');
    };

    ws.onclose = () => {
      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(() => {
          connectWebSocket();
        }, 5000);
      }
    };

    wsRef.current = ws;
  }, [roomId, setMessages]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      clear();
    };
  }, [roomId, connectWebSocket]);
};
