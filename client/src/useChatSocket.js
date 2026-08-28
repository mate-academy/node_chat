import { useEffect, useRef } from 'react';
import { WS_URL } from './config';

export function useChatSocket(onEvent) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      handlerRef.current(type, payload);
    };

    return () => socket.close();
  }, []);
}
