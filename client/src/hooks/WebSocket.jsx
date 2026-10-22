import { useCallback, useEffect, useRef, useState } from 'react';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3005';

export function useChatSocket({ onMessage, onError, onOpen }) {
  const socketRef = useRef(null);
  const callbacksRef = useRef({ onMessage, onError, onOpen });
  const [status, setStatus] = useState('connecting');
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  callbacksRef.current = { onMessage, onError, onOpen };

  useEffect(() => {
    let socket;

    try {
      socket = new WebSocket(SOCKET_URL);
    } catch (error) {
      setStatus('error');
      callbacksRef.current.onError?.(
        `Could not connect to ${SOCKET_URL}: ${error.message}`,
      );
      return undefined;
    }

    socketRef.current = socket;
    setStatus('connecting');

    socket.addEventListener('open', () => {
      setStatus('connected');
      callbacksRef.current.onOpen?.();
    });

    socket.addEventListener('message', event => {
      try {
        callbacksRef.current.onMessage?.(event);
      } catch (error) {
        callbacksRef.current.onError?.(
          `Could not process a server message: ${error.message}`,
        );
      }
    });

    socket.addEventListener('error', () => {
      setStatus('error');
      callbacksRef.current.onError?.('A WebSocket connection error occurred.');
    });

    socket.addEventListener('close', () => {
      setStatus('disconnected');
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    });

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [connectionAttempt]);

  const send = useCallback((data) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to the chat server.');
    }

    socket.send(JSON.stringify(data));
  }, []);

  const reconnect = useCallback(() => {
    setStatus('connecting');
    setConnectionAttempt(current => current + 1);
  }, []);

  return { status, send, reconnect };
}
