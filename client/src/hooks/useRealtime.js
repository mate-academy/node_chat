import { useEffect, useRef } from 'react';
import { WS_URL } from '../api/client';

// A ref holds the latest callback so the effect below never needs to
// re-run (and reconnect the socket) just because the caller's closure changed.
export function useRealtime(enabled, onEvent) {
  const handlerRef = useRef(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const socket = new WebSocket(WS_URL);

    socket.addEventListener('message', (message) => {
      const { event, payload } = JSON.parse(message.data);

      handlerRef.current(event, payload);
    });

    return () => socket.close();
  }, [enabled]);
}
