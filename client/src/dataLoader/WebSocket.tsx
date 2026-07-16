import React, { useEffect } from 'react';
import { Message } from '../types/message';

interface Props {
  onMessage: (message: Message) => void;
}

export const WebSocketLoader: React.FC<Props> = ({ onMessage }) => {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', () => {
      console.log('WebSocket connected');
    });

    socket.addEventListener('message', event => {
      if (typeof event.data !== 'string') {
        return;
      }

      const message = JSON.parse(event.data) as Message;

      onMessage(message);
    });

    socket.addEventListener('close', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.close();
    };
  }, [onMessage]);

  return <h1 className="title">WebSocket</h1>;
};
