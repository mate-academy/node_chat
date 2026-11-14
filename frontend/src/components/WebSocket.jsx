import { useEffect } from 'react';

export function WebSocketLoader({ onData, roomId, userName }) {
  useEffect(() => {
    const websocketUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
    const params = new URLSearchParams({ roomId, userName });
    const ws = new WebSocket(`${websocketUrl}?${params}`);

    ws.onmessage = function (event) {
      try {
        const parsedData = JSON.parse(event.data);
        onData(parsedData);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    ws.onerror = function (error) {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [onData, roomId, userName]);

  return null;
}
